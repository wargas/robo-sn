import { CrawlerDiferenca } from "../src/crawler-diferenca";
import { Crawler } from "../src/libs/Crawler";
import { Progress } from '../src/libs/Progress';
import { Queue } from '../src/libs/Queue';
import { DataRepository } from '../src/repositories/data.repository';
import { PgdasRepository } from '../src/repositories/pgdas.repository';

//04:45

const progress = Progress.factory('[{value}/{total}] {bar} | {percentage}% | {duration_formatted} | {CPBS} | {competencia}')
const crawler = await Crawler.factory()
const crawlerDiferenca = new CrawlerDiferenca(crawler)
const queue = Queue.factory()

const inscricoes = await PgdasRepository.getInscricoes()

const data = await DataRepository.getFromInscricoes(inscricoes)

progress.increment(0, { CPBS: '', competencia: '' })

crawlerDiferenca.events.on('competencia:start', (item: any, competencia) => {
    progress.increment(0, { ...item, competencia })
}) 

crawlerDiferenca.events.on('start', (item: any) => {
    progress.increment(0, { ...item, competencia: '' })
})

crawlerDiferenca.events.on('competencia:stop', (item: any) => {
    progress.increment(1, { competencia: '' })
})

crawlerDiferenca.events.on('done', (item: any) => {
    progress.increment(0, { competencia: '' })
})

crawlerDiferenca.events.on('fail', (item: any) => {
    // queue.push(async()=> {
    //     await crawlerDiferenca.process(item)
    // })
})

for await (let item of data) {
    queue.push(async()=> {
        await crawlerDiferenca.process(item)
    })
}

queue.push(() => {
    progress.stop()
})

progress.start(54*(queue.length-1), 0)

