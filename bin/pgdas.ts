import { CrawlerPgdas } from "../src/crawler-pgdas";
import { Crawler } from '../src/libs/Crawler';
import { Progress } from '../src/libs/Progress';
import { Queue } from '../src/libs/Queue';
import { DataRepository } from "../src/repositories/data.repository";
import { PgdasRepository } from '../src/repositories/pgdas.repository';

//19:56

const items = await DataRepository.findAll()

const queueInsert = Queue.factory()
const queueCrawler = Queue.factory()
const crawler = await Crawler.factory()


const PGDAS = new CrawlerPgdas(crawler)

const progress = Progress.multi('{title}       | {bar} {percentage}% | {value}/{total} ')

const progressCrawler = progress.create(0, 0, {title: 'obtendo'})
const progressInsert = progress.create(0, 0, {title: 'salvando'})

PGDAS.events.on('year:start', (cnpj, ano) => {
    progressCrawler.increment(1, { cnpj, ano })
})

PGDAS.events.on('year:end', (cnpj, ano) => {
    progressCrawler.increment(0, { cnpj, ano })
})

PGDAS.events.on('done', (item: any) => {
    progressCrawler.increment(0, { inscricao: item.CPBS.toString().padStart(7, '0') })
})

async function enqueueCrawler(item: any) {
    queueCrawler.push(async () => {

        try {
            const data = await PGDAS.process(item)

            if (data) {

                data.forEach(i => {
                    enqueueInsert({
                        ...i,
                        data_transmissao: new Date(i.data_transmissao).toISOString(),
                        id: `${item.CPBS}.${i.num_declaracao}`,
                        inscricao: item.CPBS.toString().padStart(7, '')
                    })
                    progressInsert.setTotal(progressInsert.getTotal() + 1)
                })

            }
        } catch (error) {
            enqueueCrawler(item)
        }
    })
}

async function enqueueInsert(data: any) {
   
    queueInsert.push(async() => {
        try {
            await PgdasRepository.createOne(data)
            progressInsert.increment(1)

        } catch (error:any) {
            
            Bun.write('./error-insert', JSON.stringify(data))
            // enqueueInsert(data)
        }
    })

   
}


for await (let item of items) {
    if(items.indexOf(item) > 110) {
        await enqueueCrawler(item)
    }
}



progressCrawler.setTotal(queueCrawler.length * 5)






