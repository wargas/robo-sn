import EventEmitter from "eventemitter3";
import type { Crawler } from "./libs/Crawler";
import { Paginate } from "./libs/Paginate";

export class CrawlerPagamento {

    events =  new EventEmitter()
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

            if(hasError) {
                this.events.emit('done', inscricao)
                return [];
            }
    
            const paginate = new Paginate(this.crawler)
    
            const pages = await paginate.getPages();
                
            const items = [];
    
            for await (let page of pages) {
                await paginate.gotTo(page);
                await Bun.sleep(500);
                const data = await this.crawler.evaluate((inscricao:string) => {
                    return Array.from(document.querySelectorAll('#pesquisaForm\\:dataTable tbody tr'))
                        .map(row => {
                            const tds = row.querySelectorAll('td')
                            return {
                                inscricao,
                                competencia: tds[0]?.textContent||'',
                                sinac: tds[1]?.textContent||'',
                                receita_bruta: tds[2]?.textContent||'',
                                rec_serv_iss_fora: tds[3]?.textContent||'',
                                rec_serv_iss_fortal: tds[4]?.textContent||'',
                                bc_iss_retido: tds[5]?.textContent||'',
                                iss_fixo_serv_contabeis: tds[6]?.textContent||'',
                                bc_iss_proprio: tds[7]?.textContent||'',
                                iss_devido: tds[8]?.textContent||'',
                                iss_recolhido: tds[9]?.textContent||'',
                                iss_parcelado: tds[10]?.textContent||'',
                                situacao_parcelamento: tds[11]?.textContent||'',
                                diferenca: tds[12]?.textContent||'',
                            }
                        })
                }, inscricao)
                
                items.push(...data)
    
            }

            this.events.emit('done', inscricao)
            
            return items;
        } catch (error) {
            this.events.emit('done', inscricao)
            return []
            console.log(error)
        }

    }
}