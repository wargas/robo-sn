import { CrawlerPagamento } from "../src/crawler-pagamento";
import { Crawler } from "../src/libs/Crawler";
import { Login } from "../src/libs/Login";
import { Progress } from "../src/libs/Progress";
import { Queue } from "../src/libs/Queue";
import { DataRepository } from "../src/repositories/data.repository";

const crawler = await Crawler.factory();
const progress = Progress.factory("[{value}/{total}] {bar} | {percentage}% | {duration_formatted}")
const queue = Queue.factory()

const crawlerPagamento = CrawlerPagamento.factory(crawler)

await Login.factory(crawler).login();

const data = await DataRepository.findAll();

const errors: string[] = []

crawlerPagamento.events.on('done', (i) => {
    // console.log(i)
    progress.increment(1)
})

crawlerPagamento.events.on('error', (i) => {
    errors.push(i)
    progress.increment(1)
})


progress.start(data.length, 0)
// const semregistro = [{ CPBS: '2448688' }, { CPBS: '2260891' }];

//226089-1 sem registro
for await (let item of data) {
    queue.push(async () => {
        await crawlerPagamento.process(item.CPBS);
    })
}

queue.push(() => {
    progress.stop();

    if (errors.length > 0) {
        console.log(`Erros em ${errors.join(", ")}`)
    } else {
        console.log(`\nConcluído com ${errors.length} erros`)
    }
    process.exit(0)
})


progress.start(queue.length - 1, 0)
// queue.start()
