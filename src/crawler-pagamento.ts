import EventEmitter from "eventemitter3";
import { get } from "lodash";
import type { Crawler } from "./libs/Crawler";
import { Paginate } from "./libs/Paginate";
import { Database } from "./libs/database";

export class CrawlerPagamento {

    events = new EventEmitter()
    constructor(private crawler: Crawler) { }

    static factory(crawler: Crawler) {
        return new CrawlerPagamento(crawler)
    }

    async process(inscricao: string) {

        try {
            await this.crawler.goto('https://issadmin.sefin.fortaleza.ce.gov.br/grpfor/pages/simplesNacional/relatorios/declaracaoPagamentoSNA.seam');

            await this.crawler.type('#pesquisaForm\\:searchFilter\\:inscricaoDec\\:inscricao', inscricao)

            await this.crawler.evaluate(() => {
                const inputStart = document.getElementById('pesquisaForm:searchFilter:competenciaInicial:competenciaInicialDtInputDate') as HTMLInputElement

                if (inputStart) {
                    inputStart.value = "07/2019"
                }

                const inputEnd = document.getElementById('pesquisaForm:searchFilter:competenciaFinal:competenciaFinalDtInputDate') as HTMLInputElement

                if (inputStart) {
                    inputEnd.value = "12/2023"
                }


            })

            await this.crawler.click('[value="Emitir Relatório"]')

            await Promise.race([
                this.crawler.waitForSelector('.rich-datascr-act,.rich-datascr-inact'),
                this.crawler.waitForSelector('.rich-messages-label')
            ])

            const hasError = await this.crawler.evaluate(() => {
                return !!document.querySelector('.rich-messages-label')
            })

            if (hasError) {
                this.events.emit('done', inscricao)
                return [];
            }

            const paginate = new Paginate(this.crawler)
            const items: any = [];
            await paginate.forEach(async() => {
                const data = await this.crawler.evaluate((inscricao: string) => {

                    const heads = Array.from(document.querySelectorAll('#pesquisaForm\\:dataTable thead th'))
                        .map(th => th.textContent) || []


                    return Array.from(document.querySelectorAll('#pesquisaForm\\:dataTable tbody tr'))
                        .map(row => {
                            const tds = row.querySelectorAll('td')

                            const data: any = {}
                            data.inscricao = inscricao;

                            heads.forEach((head, index) => {
                                data[head || ''] = tds[index].textContent
                            })


                            return data
                        })
                }, inscricao)

                function toNumber(text: string) {
                    return parseFloat(text.replace(/\./g, "")
                        .replace(/\,/g, ".")) || 0
                }

                items.push(...data.map((d: any) => {
                    return {
                        inscricao: get(d, 'inscricao'),
                        competencia: get(d, 'Competência'),
                        parcelado: toNumber(get(d, 'ISSParcelado')),
                        diferenca: toNumber(get(d, 'Diferença', '0')),

                    }
                }))
            })

            const insertData = items.map((i: any) => ({ id: `${i.inscricao}:${i.competencia}`, ...i }))


            if (insertData.length > 0) {
                await Database.factory()
                    .table('pagamento')
                    .insert(insertData)
                    .onConflict('id').merge();
            }

            this.events.emit('done', inscricao)

            return items;
        } catch (error) {
            console.log(error)
            this.events.emit('done', inscricao)
            return []
        }

    }
}