import prompts from "prompts";
import { CrawlerDiferenca } from "../src/crawler-diferenca";
import { Crawler } from "../src/libs/Crawler";
import { Progress } from '../src/libs/Progress';
import { Queue } from '../src/libs/Queue';
import { DataRepository } from '../src/repositories/data.repository';
import { PgdasRepository } from '../src/repositories/pgdas.repository';

const { start } = await prompts([{
    type: 'date',
    message: 'Informe o início',
    name: 'start',
    mask: 'DD/MM/YYYY'
}])

const progress = Progress.factory('[{value}/{total}] {bar} | {percentage}% | {value}/{total} | {CPBS} | {competencia}')
const crawler = await Crawler.factory()
const crawlerDiferenca = new CrawlerDiferenca(crawler)
const queue = Queue.factory()

const inscricoes = await PgdasRepository.getInscricoes(start)

const data = await DataRepository.getFromInscricoes(inscricoes)

crawlerDiferenca.events.on('competencia:start', (item: any, competencia) => {
    progress.increment(0, { competencia })
})

crawlerDiferenca.events.on('start', (item: any) => {
    progress.increment(0, { ...item, competencia: '' })
})

crawlerDiferenca.events.on('done', (item: any) => {
    progress.increment(1, { competencia: '' })
})

crawlerDiferenca.events.on('fail', (item: any) => {
    // queue.push(async()=> {
    //     await crawlerDiferenca.process(item)
    // })
})

for await (let item of data) {
    queue.push(async () => {
        await crawlerDiferenca.process(item)
    })
}

progress.start(queue.length, 0)

