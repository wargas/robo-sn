import EventEmitter from "eventemitter3";
import { domGetDataPGdas } from "./dom/data-pgdas";
import { domFillPgdass } from "./dom/fill-pgdas";
import { Crawler } from "./libs/Crawler";
import { Work } from "./libs/Work";

type Item = {
    pa: string
    operacao: string
    num_declaracao: string
    data_transmissao: string
}


export class CrawlerPgdas extends Work {

    constructor(private crawler: Crawler) {
        super()
    }

    async process(item: any, retry = 0): Promise<Item[] | null> {
        const anos = ['2019', '2020', '2021', '2022', '2023']

        const cnpj = item.CNPJ_BASE.padStart(8, '0')

        this.events.emit('start', item)

        const data: any[] = []
        try {
            await this.crawler.goto('https://www10.receita.fazenda.gov.br/EntesSN/app/ATSPO/consultagestor.app/')
            for await (let ano of anos) {
                this.events.emit('year:start', cnpj, ano)
                await this.crawler.evaluate(domFillPgdass, cnpj, ano)
                while (true) {
                    await this.crawler.click('.btn-success')

                    await Promise.race([
                        this.crawler.waitForSelector('table.consulta:not(#tributos-extrato-malha)'),
                        this.crawler.waitForSelector('.alert-warning'),
                        this.crawler.waitForSelector('.alert-danger li'),
                        this.crawler.waitForSelector('.alert-danger:not(#jsMsgBox)'),
                    ])

                    const hasErrorServer = await this.crawler.evaluate(() => {
                        return document.body.innerHTML.includes('Erro ao obter dados')
                    })

                    if (!hasErrorServer) {
                        break
                    }

                }

                await this.crawler.sleep(500)

                const dados = await this.crawler.evaluate(domGetDataPGdas)

                data.push(...dados)

                this.events.emit('year:end', cnpj, ano)
            }
            this.events.emit('done', item)
        } catch (error) {
            this.events.emit('fail', cnpj)
            return null;
        }

        return data;
    }



}