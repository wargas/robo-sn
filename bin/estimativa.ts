import { CrawlerCPBS } from "../src/crawler-cpbs";
import { Crawler } from "../src/libs/Crawler";

const crawler = await Crawler.factory()
const crawlerCPBS = new CrawlerCPBS(crawler);