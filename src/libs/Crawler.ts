import EventEmitter from "eventemitter3";
import type { Browser, Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";

export class Crawler extends EventEmitter {
    browser: Browser = {} as Browser;
    page: Page  = {} as Page;

   
    async connect() {
        try {

            this.browser = await puppeteer.connect({
                browserURL: 'http://127.0.0.1:9222/json',
                defaultViewport: null
            }) 
            
            this.emit(`browser:connected`, this.browser)
            this.page = await this.browser.newPage()
            this.emit(`browser:newPage`, this.page)
        } catch(e) {
            console.log('error ao connecctar')
        }
    }

    static async factory() {
        const c = new Crawler();
        await c.connect()

        return c;
    }

    
    async waitForSelector(selector: string) {
        await this.page.waitForSelector(selector)
    }

    async waitForFunction(pageFunction:any, ...args: any[]) {
        return new Promise(async acc => {
            while(true) {
                const value = await this.evaluate(pageFunction, ...args)

                if(value) {
                    acc(value)
                    break;
                }
            }
        })
    }
  
    async goto(url: string) {
        await this.page.goto(url)
    }

    async click(selector: string) {
        await this.page.waitForSelector(selector)
        await this.page.click(selector)
    }
   
    async type(selector: string, value:string) {
        await this.page.waitForSelector(selector)
        await this.page.type(selector, value)
    }


    async select(selector: string, value:string) {
        await this.page.waitForSelector(selector)
        await this.page.select(selector, value)
    }

  
    async evaluate(pageFunction:any, ...args:any[]) {
        return this.page.evaluate(pageFunction, ...args)
    }

    async evaluateBefore(selector: string, pageFunction:any, ...args: any[]) {
        await this.waitForSelector(selector)
        return this.evaluate(pageFunction, ...args)
    }

   
    async sleep(time = 500) {
        return new Promise(acc => {
            setTimeout(() => {
                acc(true)
            }, time)
        })
    }

  
    async close() {
        this.page.close()
    }

}