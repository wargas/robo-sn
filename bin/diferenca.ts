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


const crawler = await Crawler.factory()
const crawlerDiferenca = new CrawlerDiferenca(crawler)

const controle = await Controle.getAll()

const inscricoes = await PgdasRepository.getInscricoes(start)

const data = await DataRepository.getFromInscricoes(inscricoes.filter(i => !controle.includes(i)))

crawlerDiferenca.progress.increment(0, { CPBS: '', competencia: '' })

crawlerDiferenca.events.on('competencia:start', (item: any, competencia) => {
    crawlerDiferenca.progress.increment(0, { ...item, competencia })
}) 

crawlerDiferenca.events.on('start', (item: any) => {
    crawlerDiferenca.progress.increment(0, { ...item, competencia: '' })
})

crawlerDiferenca.events.on('competencia:stop', (item: any) => {
    crawlerDiferenca.progress.increment(0, { competencia: '' })
})

crawlerDiferenca.events.on('done', async(item: any) => {
    crawlerDiferenca.progress.increment(1, { competencia: '' })
    await Controle.add(item.CPBS);
})

crawlerDiferenca.events.on('fail', (item: any) => {
    crawlerDiferenca.progress.increment(1, item)
})

for await (let item of data) {
    crawlerDiferenca.queue.push(async () => {
        await crawlerDiferenca.process(item)
    })
}

crawlerDiferenca.queue.push(() => {
    crawlerDiferenca.progress.stop()
})

crawlerDiferenca.progress.start(crawlerDiferenca.queue.length-1, 0)

