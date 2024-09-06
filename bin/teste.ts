import { CrawlerDiferenca } from "../src/crawler-diferenca";
import { CrawlerOs } from "../src/crawler-os";
import { Crawler } from "../src/libs/Crawler";

const crawler = await Crawler.factory()
const crawlerDiferenca = new CrawlerDiferenca(crawler)

await crawlerDiferenca.process({CPBS: '2548844'})