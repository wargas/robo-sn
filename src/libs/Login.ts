import prompts from "prompts";
import type { HTTPResponse } from "puppeteer-core";
import type { Crawler } from "./Crawler";

export class Login {
    constructor(private crawler: Crawler) { }

    static factory(crawler: Crawler) {
        return new Login(crawler)
    }

    async login() {
        return new Promise(async (resolve, reject) => {
            this.crawler.page.on('response', req => this.onResponse(req, resolve))

            await this.crawler.goto('https://issadmin.sefin.fortaleza.ce.gov.br/grpfor')
        })
    }

    async onResponse(req: HTTPResponse, resolve:any) {
        const url = req.url();

        if (url.includes('protocol/openid-connect/auth')) {
            await this.onLoginPage()
        }

        if (url.includes('/selecionarUnidadeFuncional.seam')) {
            // console.log(url)
            await this.onSelectUnidade()
        }

        if (url.includes('/home.seam?cid=')) {
            // console.log(url)
            this.crawler.off('response', this.onResponse)
            resolve(true)
        }
    }

    async onLoginPage() {
        const { cpf, senha } = await prompts([
            {
                name: 'cpf',
                message: 'informe o cpf',
                type: 'text',
            },
            {
                name: 'senha',
                message: 'informe sua senha',
                type: 'password',
            }
        ])

        const strCpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")

        await this.crawler.evaluate((strCpf:string, senha:string) => {
            const username = document.getElementById('username') as HTMLInputElement;
            const password = document.getElementById('password') as HTMLInputElement;

            username.value = strCpf
            password.value = senha

        }, strCpf, senha)

       
        await Bun.sleep(500);
        await this.crawler.click('[value=Entrar]')
    }

    async onSelectUnidade() {
        try {
            await this.crawler.select('#formSelecionarUnidadeFuncional\\:unidadeFuncionalDec\\:uf', '0')
            
            await this.crawler.click('[value=Selecionar]');
        } catch (error) {
            
        }
    }
}