import type { Crawler } from "./libs/Crawler";

export class CrawlerEscrituracao {
    
    constructor(private crawler: Crawler) { }

    async process(inscricao: string) {
        try {
            await this.crawler.goto('https://issadmin.sefin.fortaleza.ce.gov.br/grpfor/pages/nfse/escrituracaoFiscalAdmin.seam?cid=9138')

            await this.crawler.type('#escrituracaoFiscalAdminForm\\:pesquisaCPBS\\:inscricao', inscricao);

            await this.crawler.click('input[value="Recuperar"]')

            await this.crawler.waitForSelector('input[value="Consultar"]')

            await this.crawler.evaluate(() => {
                const inicio = document.getElementById('escrituracaoFiscalAdminForm:dataInicialDiv:competenciaInicialInputDate') as HTMLInputElement;
                const fim = document.getElementById('escrituracaoFiscalAdminForm:dataFinalDiv:competenciaFinalInputDate') as HTMLInputElement;
                if (inicio) {
                    inicio.value = '01/2024'
                }
                if (fim) {
                    fim.value = '08/2024'
                }
            })

            await this.crawler.click('input[value="Exportar"]')

            await this.crawler.waitForSelector('.rich-messages-label')
            
        } catch (error) {

        }
    }
}