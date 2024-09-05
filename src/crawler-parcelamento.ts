import EventEmitter from "eventemitter3";
import type { Crawler } from "./libs/Crawler";
import { Database } from "./libs/database";
import { Work } from "./libs/Work";

export class CrawlerParcelamento extends Work {

    constructor(private crawler: Crawler) { 
        super()
    }

    static factory(crawler: Crawler) {
        return new CrawlerParcelamento(crawler)
    }

    async process(item:any) {
        const cnpj = String(item.CNPJ_MATRIZ).padStart(14, '0')
        try {
            await this.crawler.goto("https://www10.receita.fazenda.gov.br/entessn/home.aspx");

            await this.crawler.page.waitForSelector("#menu-esquerda");

            await Bun.sleep(500);

            await this.crawler.page.evaluate(() => {
                const menuPai = document.querySelector("#menu-esquerda > ul > li:nth-child(7) > a") as HTMLAnchorElement;

                (menuPai.parentElement?.querySelector('.servicosGrupoPai li a') as HTMLAnchorElement).click()
            })


            await this.crawler.waitForSelector('#ctl00_contentPlaceH_txtCNPJ')

            await this.crawler.type('#ctl00_contentPlaceH_txtCNPJ', cnpj)

            await this.crawler.click("#ctl00_contentPlaceH_btnContinuar");

            await Promise.race([
                this.crawler.waitForSelector('#ctl00_contentPlaceH_wcParc_gdv tbody tr'),
                this.crawler.waitForSelector('#popup_message'),
            ])

            const hasMessage = await this.crawler.evaluate(() => {
                return !!document.getElementById('popup_message')
            })



            if (hasMessage) {
                this.events.emit('done', item)
                return null;
            }



            const items = await this.crawler.evaluate((cpbs:string) => {
                const rows = document.querySelectorAll('#ctl00_contentPlaceH_wcParc_gdv tbody tr')

                return Array.from(rows).filter((_, i) => i > 0).map(row => {
                    const cels = row.querySelectorAll('td,th');
                    return {
                        inscricao: cpbs.padStart(7, '0'),
                        numero: parseInt(cels[0].textContent || ''),
                        data_pedido: String(cels[1].textContent).replace(/^(\d+)\/(\d+)\/(\d+)$/, "$3-$2-$1"),
                        situacao: cels[2].textContent,
                        data_situacao: String(cels[3].textContent).replace(/^(\d+)\/(\d+)\/(\d+)$/, "$3-$2-$1"),
                        observacao: cels[4].textContent?.trim()
                    }
                })
            }, item.CPBS) as any[]


            if (items.length > 0) {
                await Database.factory()
                    .table('parcelamentos')
                    .insert(items);

            }

            this.events.emit('done', item)

            return items;
        } catch (error) {
            this.events.emit('error', item)
            return null
        }

    }
}