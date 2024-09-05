import { CrawlerPagamento } from "../src/crawler-pagamento";
import { Crawler } from "../src/libs/Crawler";
import { DataRepository } from "../src/repositories/data.repository";

const crawler = await Crawler.factory();
const crawlerPagamento = CrawlerPagamento.factory(crawler)

const data = await DataRepository.findAll();

const errors: string[] = []

crawlerPagamento.events.on('done', (i) => {
    crawlerPagamento.progress.increment(1)
})

crawlerPagamento.events.on('error', (i) => {
    errors.push(i)
    crawlerPagamento.progress.increment(1)
})


crawlerPagamento.progress.start(data.length, 0)

for await (let item of data) {
    crawlerPagamento.queue.push(async () => {
        await crawlerPagamento.process(item.CPBS);
    })
}

crawlerPagamento.queue.push(() => {
    crawlerPagamento.progress.stop();

    if(errors.length > 0) {
        console.log(`Erros em ${errors.join(", ")}`)
    } else {
        console.log(`\nConcluído com ${errors.length} erros`)
    }
    process.exit(0)
})


crawlerPagamento.progress.start(crawlerPagamento.queue.length - 1, 0)
