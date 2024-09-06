import EventEmitter from "eventemitter3";
import { domDataCompetencia } from "./dom/data-competencia";
import { domDataDiferenca } from "./dom/data-diferenca";
import { FillEscrituracaoCompetencias } from "./dom/fill-escrituracao-competencias";
import { Crawler } from "./libs/Crawler";
import { range } from "./libs/Helper";
import { DiferencaRepository } from "./repositories/diferenca.repository";
import { Work } from "./libs/Work";
import { Paginate } from "./libs/Paginate";

export class CrawlerDiferenca extends Work {

    constructor(private crawler: Crawler) {
        super()
    }

    async process(item: any) {

        this.events.emit('start', item)

        try {

            await this.crawler.goto('https://issadmin.sefin.fortaleza.ce.gov.br/grpfor/pages/nfse/escrituracaoFiscalAdmin.seam?cid=9138')

            await this.crawler.type('#escrituracaoFiscalAdminForm\\:pesquisaCPBS\\:inscricao', item.CPBS.toString().padStart(7, '0'));

            await this.crawler.click('input[value="Recuperar"]')

            await this.crawler.waitForSelector('input[value="Consultar"]')

            await this.crawler.evaluate(FillEscrituracaoCompetencias)

            await this.crawler.click('input[value="Consultar"]')

            await this.crawler.waitForSelector('#escrituracaoFiscalAdminForm\\:dataTable\\:tb')

            const paginate = new Paginate(this.crawler);

            await paginate.forEach(async p => {
                const linksCompetencias = await this.crawler.page.$$('#escrituracaoFiscalAdminForm\\:dataTable\\:tb a')

                for await (const link of linksCompetencias) {
                    link.click()
                    await this.crawler.waitForSelector('#escrituracaoFiscalAdminForm\\:tabs')

                    const tabIss = await this.crawler.evaluate(() => {
                        const aba = document.querySelector('#escrituracaoFiscalAdminForm\\:abaEspelhoSimplesNacional_lbl') as HTMLAnchorElement

                        if (aba) {
                            aba.click()
                            return true
                        }
                        return false
                    })


                    if (!tabIss) {
                        continue;
                    }

                    await this.crawler.waitForSelector('#escrituracaoFiscalAdminForm\\:abaEspelhoSimplesNacionalForm\\:dataTableEspelhoSimplesNacional\\:tb')
                    const data = await this.crawler.evaluate(domDataDiferenca, item.CPBS.toString().padStart(7, '0'))

                    await DiferencaRepository.upsert(data)

                    this.events.emit('competencia:stop', item)

                    await this.crawler.evaluate(() => {
                        document.getElementById('escrituracaoFiscalAdminForm:tabs')?.remove()
                    })
                }
            })

            this.events.emit('done', item)
            return;
        } catch (error) {
            this.events.emit('fail', item)
            return;
        }

    }
}