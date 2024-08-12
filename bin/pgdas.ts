import { CrawlerPgdas } from "../src/crawler-pgdas";
import { Crawler } from '../src/libs/Crawler';
import { Progress } from '../src/libs/Progress';
import { Queue } from '../src/libs/Queue';
import { DataRepository } from "../src/repositories/data.repository";
import { PgdasRepository } from '../src/repositories/pgdas.repository';

const items = await DataRepository.findAll()

const queueCrawler = Queue.factory()
const crawler = await Crawler.factory()

const PGDAS = new CrawlerPgdas(crawler)

const progress = Progress.factory('{bar} {percentage}% | {value}/{total} | {duration_formatted}')

PGDAS.events.on('year:start', (cnpj, ano) => {

    progress.increment(1, { cnpj, ano })
})

PGDAS.events.on('year:end', (cnpj, ano) => {
    progress.increment(0, { cnpj, ano })
})

PGDAS.events.on('done', (item: any) => {
    progress.increment(0, { inscricao: item.CPBS.toString().padStart(7, '0') })
})

const errors:string[] = []

async function enqueueCrawler(item: any, retry = 0) {
    
    queueCrawler.push(async () => {

        try {
            const data = (await PGDAS.process(item)) || []

            if (data.length > 0) {
                await PgdasRepository.createMany(data.map(i => {
                    return {
                        ...i,
                        data_transmissao: new Date(i.data_transmissao).toISOString(),
                        id: `${item.CPBS}.${i.num_declaracao}`,
                        inscricao: item.CPBS.toString().padStart(7, '')
                    }
                }))
            }

        } catch (error) {
            if(retry < 2) {
                enqueueCrawler(item, retry + 1)
            } else {
                errors.push(item.CPBS.toString().padStart(7, ''))
            }
        }
    })
}


for await (let item of items) {
    // if(items.indexOf(item) <= 3)
        await enqueueCrawler(item)
}

queueCrawler.push(() => {
    progress.stop()
    console.log(`finalizado com ${errors.length} erros\n`)
    if(errors.length > 0) {
        console.log(errors.join(", "))
    }
})


progress.start((queueCrawler.length-1) * 5, 0)






