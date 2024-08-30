import { CrawlerOs } from "../src/crawler-os";
import { Crawler } from "../src/libs/Crawler";

const crawler = new Crawler()
await crawler.connect()

const crawlerOs = new CrawlerOs(crawler)

await crawlerOs.all()