import { auditores } from "./config/auditores";
import type { Crawler } from "./libs/Crawler";
import { Database } from "./libs/database";
import { Paginate } from "./libs/Paginate";
import { Work } from "./libs/Work";

export class CrawlerOs extends Work {

    constructor(private crawler: Crawler) {
        super()
    }

    async all() {
        for await (let auditor of auditores) {
            console.log(auditor.nome)
            await this.process(auditor)
        }
    }

    async process(auditor: typeof auditores[0]) {
        await this.crawler.goto(`https://gefit.sefin.fortaleza.ce.gov.br/gefit/pages/acaoFiscal/consultarOrdemServico.seam?pAuditor=${auditor.id}`)

        const paginate = new Paginate(this.crawler, "#pesquisaForm\\:tableContainer");

        await paginate.forEach(async (p) => {
            await this.crawler.waitForSelector("#pesquisaForm\\:dataTable\\:tb")

            const items = await this.crawler.evaluate(() => {
                const rows = document.querySelectorAll("#pesquisaForm\\:dataTable\\:tb tr");

                return Array.from(rows).map(row => {
                    const cels = row.querySelectorAll("td");

                    return {
                        id: cels[9].outerHTML.replace(/\n/g, "").replace(/.*\.seam\?i=(\d+)&.*/, "$1"),
                        os: cels[0].textContent,
                        especie: cels[1].textContent,
                        paf: cels[2].textContent,
                        cnpj: cels[3]?.textContent?.replace(/(\d+\.\d+\.\d+\/\d+-\d+).*/, "$1").replace(/\D/g, ""),
                        nome: cels[3]?.textContent?.replace(/(\d+\.\d+\.\d+\/\d+-\d+) - (.*)/, "$2"),
                        auditor: cels[6].textContent,
                        evento: cels[7].textContent
                    }
                })
            })

            await Database.factory().table('ordens')
                .insert(items)
                .onConflict('paf').merge()
        })
    }
}