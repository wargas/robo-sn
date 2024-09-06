import type { Crawler } from "./libs/Crawler";
import { Work } from "./libs/Work";

export class CrawlerCPBS extends Work {

    constructor(private crawler: Crawler) {
        super()
    }

    async process(cnae: string, tipo = "J") {

        this.events.emit('start', cnae)

        try {
            await this.crawler.goto('https://issadmin.sefin.fortaleza.ce.gov.br/grpfor/pages/cpbs/consultarCPBS/consultarCPBSPesquisa.seam')

            await this.crawler.waitForSelector('#pesquisaForm\\:cnaeCodigoDec\\:cnae')

            await this.crawler.evaluate((cnae: string,tipo: "P"|"J") => {
                (document.querySelector('#pesquisaForm\\:cnaeCodigoDec\\:cnae') as HTMLInputElement).value = cnae;
                (document.querySelector(`[value="${tipo}"]`) as HTMLButtonElement).click();
                (document.querySelector('#pesquisaForm\\:botaoPesquisar') as HTMLButtonElement).click();
            }, cnae, tipo)

            const waitForDownload = this.crawler.waitForDownload();

            await this.crawler.click('[value="Gerar Excel"]')

            const download = await waitForDownload

            await download.saveAs(`cpbs/${cnae}.xlsx`)

            this.events.emit('done', cnae)
            return true;
        } catch (error) {
            this.events.emit('fail', cnae)
            return false;
        }
    }
}