import { CrawlerExtratos } from "../src/crawler-extrato";
import { Crawler } from "../src/libs/Crawler";
import { Progress } from "../src/libs/Progress";
import { DataRepository } from "../src/repositories/data.repository";
import fs from 'fs';

const crawler = await Crawler.factory();
const crawlerExtratos = await CrawlerExtratos.factory(crawler);
const progress = Progress.factory('[{value}/{total}] {bar} | {percentage}% | {duration_formatted} | {CPBS}')

const data = await DataRepository.findAll()

crawlerExtratos.events.on('done', item => {
    progress.increment(1, item)
})

crawlerExtratos.events.on('fail', item => {
    progress.increment(1, item)
})

const files = fs.readdirSync('./extratos')
    .map(f => f.replace(".xlsx", ""))

progress.start(data.length, 0)

for await (let item of data) {
    if(!files.includes(item.CPBS)) {
        await crawlerExtratos.process(item)
    }
}

process.exit(0)