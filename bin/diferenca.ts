import prompts from "prompts";
import { CrawlerDiferenca } from "../src/crawler-diferenca";
import { Crawler } from "../src/libs/Crawler";
import { Progress } from '../src/libs/Progress';
import { Queue } from '../src/libs/Queue';
import { DataRepository } from '../src/repositories/data.repository';
import { PgdasRepository } from '../src/repositories/pgdas.repository';
import { Controle } from "../src/libs/controle";

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

const controle = await Controle.getAll()

const inscricoes = await PgdasRepository.getInscricoes(start)

const data = await DataRepository.getFromInscricoes(inscricoes.filter(i => !controle.includes(i)))

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
    progress.increment(1, { competencia: '' })
    await Controle.add(item.CPBS);
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

queue.push(() => {
    progress.stop()
})

progress.start(queue.length-1, 0)

