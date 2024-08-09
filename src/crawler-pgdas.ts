import EventEmitter from "eventemitter3";
import { domGetDataPGdas } from "./dom/data-pgdas";
import { domFillPgdass } from "./dom/fill-pgdas";
import { Crawler } from "./libs/Crawler";

type Item = {
    pa: string
    operacao: string
    num_declaracao: string
    data_transmissao: string
}


export class CrawlerPgdas {

    events = new EventEmitter()
    
    constructor(private crawler: Crawler) {}

    async process(item: any, retry = 0): Promise<Item[] | null> {
        const anos = ['2019', '2020', '2021', '2022', '2023']

        const cnpj = item.CNPJ_BASE.padStart(8, '0')
    
        this.events.emit('start', item)
        
        const data:any[] = []
        try {
            await this.crawler.goto('https://www10.receita.fazenda.gov.br/EntesSN/app/ATSPO/consultagestor.app/')
            for await (let ano of anos) {
                this.events.emit('year:start', cnpj, ano)
                await this.crawler.evaluate(domFillPgdass, cnpj, ano)
                await this.crawler.click('.btn-success')
    
                await Promise.race([
                    this.crawler.waitForSelector('table.consulta:not(#tributos-extrato-malha)'),
                    this.crawler.waitForSelector('.alert-warning'),
                    this.crawler.waitForSelector('.alert-danger li')
                ])
    
                await this.crawler.sleep(500)
    
                const dados = await this.crawler.evaluate(domGetDataPGdas)
    
                data.push(...dados)

                this.events.emit('year:end', cnpj, ano)
            }
            this.events.emit('done', item)
        } catch (error) {
            this.events.emit('fail', cnpj)
            return null;
        } finally {
            // this.events.emit('done')
            // this.crawler?.close()
        }
    
        return data;
    }

    

}