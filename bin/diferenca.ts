import prompts from "prompts";
import { CrawlerDiferenca } from "../src/crawler-diferenca";
import { Controller } from "../src/libs/controller";
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

const progress = Progress.factory('[{value}/{total}] {bar} | {percentage}% | {duration_formatted} | {CPBS} | {competencia}')
const crawler = await Crawler.factory()
const crawlerDiferenca = new CrawlerDiferenca(crawler)
const queue = Queue.factory()

const inscricoes = await PgdasRepository.getInscricoes(start)

const data = await DataRepository.getFromInscricoes(inscricoes)

progress.increment(0, { CPBS: '', competencia: '' })

crawlerDiferenca.events.on('competencia:start', (item: any, competencia) => {
    progress.increment(0, { ...item, competencia })
})

crawlerDiferenca.events.on('start', (item: any) => {
    progress.increment(0, { ...item, competencia: '' })
})

crawlerDiferenca.events.on('competencia:stop', (item: any) => {
    progress.increment(0, { competencia: '' })
})

crawlerDiferenca.events.on('done', async(item: any) => {
    await Controller.add(item.CPBS)
    progress.increment(1, { competencia: '' })
})

const errors: string[] = []

crawlerDiferenca.events.on('fail', (item: any) => {

    errors.push(item.CPBS)

})

for await (let item of data) {
    const processado = await Controller.has(item.CPBS)

    if (!processado) {
        queue.push(async () => {
            await crawlerDiferenca.process(item)
        })
    }
}

queue.push(() => {
    console.log(`finalizado\nErrors: ${errors.join('\n')}`)
    progress.stop()
    process.exit(0)
})

progress.start(queue.length - 1, 0)

