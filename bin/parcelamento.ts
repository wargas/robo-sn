import { CrawlerParcelamento } from "../src/crawler-parcelamento";
import { Crawler } from "../src/libs/Crawler";
import { Progress } from "../src/libs/Progress";
import { DataRepository } from "../src/repositories/data.repository";

const crawler = await Crawler.factory();
const crawlerParcelamento = await CrawlerParcelamento.factory(crawler);

const data = await DataRepository.findAll()

crawlerParcelamento.events.on('done', item => {
    crawlerParcelamento.progress.increment(1, item)
})

crawlerParcelamento.events.on('fail', item => {
    crawlerParcelamento.progress.increment(1, item)
})

crawlerParcelamento.progress.start(data.length, 0);

for await (let item of data) {
    await crawlerParcelamento.process(item)
}

//9107230000129