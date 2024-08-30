import type { Crawler } from "./Crawler";

export class Paginate {

    page = 0;

    constructor(private crawler: Crawler) { }


    async gotTo(page: string | number) {
        let prevPage = await this.currentPage();

        if (String(page) == String(prevPage)) {
            return true;
        }


        const hasNext = await this.crawler.evaluate((prevPage: number, page: string) => {
            const nextPage = Array.from(document.querySelectorAll<HTMLAnchorElement>('.rich-datascr-act,.rich-datascr-inact'))
                .find(p => p.textContent == String(page));
            if (nextPage) {
                nextPage.click()
                return true;
            }
            return false
        }, prevPage, page)

        if (!hasNext) {
            return false;
        }

        while (true) {
            const currentPage = await this.currentPage();


            if (currentPage != prevPage) {
                break;
            }
        }

        return await this.currentPage();
    }

    async currentPage() {
        await this.crawler.waitForSelector('.rich-datascr-act')
        return await this.crawler.evaluate(() => {
            const pageText = document.querySelector('.rich-datascr-act')?.textContent || '0';

            return parseInt(pageText)
        })
    }

    async getPages(): Promise<string[]> {
        await this.crawler.waitForSelector('.rich-datascr-act,.rich-datascr-inact')
        return this.crawler.evaluate(() => {
            return Array.from(document.querySelectorAll<HTMLAnchorElement>('.rich-datascr-act,.rich-datascr-inact'))
                .map(p => p.textContent)
        })
    }

    async isLast() {
        await this.crawler.waitForSelector('.rich-datascr-act,.rich-datascr-inact')

        return this.crawler.evaluate(() => {

            const btns = Array.from(document.querySelectorAll('.rich-datascr-button'));
            const last = btns[btns.length - 1]

            return last.classList.contains('rich-datascr-button-dsbld')
        })
    }

    async forEach(func: (page: number) => Promise<void>) {

        return new Promise(async (a) => {

            await this.gotTo(1)

            while (true) {
                const curr = await this.currentPage()

                await func(curr)


                const isLast = await this.isLast()

                if (isLast) {
                    break;
                }

                await this.gotTo(curr + 1)
            }

            a(true)
        })
    }


}