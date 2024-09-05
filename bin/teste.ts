import { CrawlerOs } from "../src/crawler-os";
import { Crawler } from "../src/libs/Crawler";

const crawler = await Crawler.factory();
const crawlerOS = new CrawlerOs(crawler);

await crawlerOS.all();

process.exit(0)
