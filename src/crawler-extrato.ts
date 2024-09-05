import EventEmitter from "eventemitter3";
import type { Crawler } from "./libs/Crawler";
import { Database } from "./libs/database";

export class CrawlerExtratos {

    events = new EventEmitter()
    constructor(private crawler: Crawler) { }

    static factory(crawler: Crawler) {
        return new CrawlerExtratos(crawler)
    }

    async process(item: any) {
        const inscricao = String(item.CPBS).padStart(7, '0')
        try {

            await this.crawler.goto("https://issadmin.sefin.fortaleza.ce.gov.br/grpfor/home.seam")

            await this.crawler.evaluate(() => {
                (document.getElementById('formMenuTopo:menuIssFortaleza:extratomovimentacao') as HTMLAnchorElement).click();
            })

            await this.crawler.waitForSelector('#pesquisaCPBS\\:inscricao')

            await this.crawler.type("#pesquisaCPBS\\:inscricao", inscricao);
            await this.crawler.click("[value=Recuperar]")

            await this.crawler.waitForSelector('[value=ANALITICO]')

            await this.crawler.evaluate(() => {
                (document.getElementById('dataInicialDiv:competenciaInicialInputDate') as HTMLInputElement).value = "07/2019";
                (document.getElementById('dataFinalDiv:competenciaFinalInputDate') as HTMLInputElement).value = "12/2023";
            })

                       
            await this.crawler.click('[value=ANALITICO]')
            await this.crawler.click('[value=PAG_REALIZADOS]')
            
            const waitDownload = this.crawler.waitForDownload()
            
            await this.crawler.click('[value="Baixar Planilha"]')

            await this.crawler.click('[value=PAG_REALIZADOS]')

            await this.crawler.click('[value="Baixar Planilha"]')
            
            const download = await waitDownload;

            await download.saveAs(`./extratos/${inscricao}.xlsx`)

            this.events.emit('done', item)

            return true;
        } catch (error) {
            this.events.emit('error', item)
            return null
        }

    }
}