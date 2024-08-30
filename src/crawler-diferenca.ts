import EventEmitter from "eventemitter3";
import { domDataCompetencia } from "./dom/data-competencia";
import { domDataDiferenca } from "./dom/data-diferenca";
import { FillEscrituracaoCompetencias } from "./dom/fill-escrituracao-competencias";
import { Crawler } from "./libs/Crawler";
import { range } from "./libs/Helper";
import { DiferencaRepository } from "./repositories/diferenca.repository";

export class CrawlerDiferenca {
    events = new EventEmitter()
    constructor(private crawler: Crawler) { }

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

            for await (let page of range(1, 6)) {
                await this.crawler.click(`.rich-datascr td:nth-child(${page + 3})`)

                
                while (true) {
                    
                    const currentPage = await this.crawler.evaluate(() => {
                        return document.querySelector('.rich-datascr-act')!.textContent
                    })

                    if (currentPage == page.toString()) {
                        break;
                    }
                }

                const items = await this.crawler.page.$$('#escrituracaoFiscalAdminForm\\:dataTable\\:tb a')

                
                for await (const currentItem of items) {

                                       
                    const oldCompetencia = await this.crawler.evaluate(domDataCompetencia)

                         
                    currentItem.click()

                    while (true) {
                        const newCompetencia = await this.crawler.evaluate(domDataCompetencia)
                        
                        
                        if (newCompetencia != oldCompetencia) {
                            this.events.emit('competencia:start', item, newCompetencia)
                            break;
                        }

                       
                    }

                    
                    await this.crawler.waitForSelector('#escrituracaoFiscalAdminForm\\:abaEncerramento_lbl')

                    const hasAbaSimples = await this.crawler.evaluate(() => {
                        const abaSimples = document.getElementById('escrituracaoFiscalAdminForm:abaEspelhoSimplesNacional_lbl')

                        if (abaSimples) {
                            abaSimples.click()
                            return true;
                        }

                        return false

                    })

                   
                    if (!hasAbaSimples) {
                        continue;
                    }

                    await this.crawler.waitForSelector('#escrituracaoFiscalAdminForm\\:abaEspelhoSimplesNacionalForm\\:dataTableEspelhoSimplesNacional\\:tb')
                    const data = await this.crawler.evaluate(domDataDiferenca, item.CPBS.toString().padStart(7, '0'))

                    // console.log(data)

                    await DiferencaRepository.upsert(data)
                   
                    this.events.emit('competencia:stop', item)
                }
            }

            this.events.emit('done', item)
            return;
        } catch (error) {
            console.log(error)
            this.events.emit('fail', item)
            return;
        } finally {
            // this.crawler?.close()
            // this.events.emit('done', item)
        }
        return;

    }
}