import { auditores } from "./config/auditores";
import type { Crawler } from "./libs/Crawler";

export class CrawlerOs {

    constructor(private crawler: Crawler) { }

    async all() {
        for await (let auditor of [auditores[5]]) {
            await this.getIds(auditor)
        }
    }

    async getIds(auditor: typeof auditores[0]) {
        await this.crawler.goto(`https://gefit.sefin.fortaleza.ce.gov.br/gefit/pages/acaoFiscal/consultarOrdemServico.seam?pAuditor=${auditor.id}`)
        while (true) {

            await this.crawler.waitForSelector('#pesquisaForm\\:dataTable\\:tb')

            const oss = await this.crawler.evaluate(() => {
                const trs = document.querySelectorAll('#pesquisaForm\\:dataTable\\:tb tr')

                return Array.from(trs).map((tr) => {
                    const id = Array.from(tr.querySelectorAll('.menu-icon-link'))
                        .find(a => ["Detalhar PAF", "Detalhar OS"]
                            .includes((a.textContent || '').trim()))?.outerHTML
                        .replace(/\n/g, "")
                        .replace(/\t/g, "")
                        .replace(/.*?\?i=([0-9]+)(.*)/, "$1")
                    const tds = tr.querySelectorAll('td')

                    return {
                        id,
                        numero: tds[0].textContent,
                        paf: tds[2].textContent,
                        sujeito: tds[3].textContent,
                        lastEvent: tds[7].textContent
                    }
                })

            })

            console.log(oss)

            const hasNext = await this.crawler.evaluate(() => {
                const pages = Array.from(document.querySelectorAll<HTMLAnchorElement>('.rich-datascr-act,.rich-datascr-inact'))
                const current = document.querySelector('.rich-datascr-act')?.textContent||'1'

                const nextPage = pages.find(p => p.textContent == current+1)

                if(nextPage) {
                    nextPage.click()
                    while(true) {
                        const current2 = document.querySelector('.rich-datascr-act')
                        if(current != current2?.textContent) {
                            break
                        }
                    }

                    return true
                }

                return false
            })

            if(!hasNext) {
                break
            }
        }
    }
}