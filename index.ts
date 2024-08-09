import { Crawler } from "./src/libs/Crawler";


const crawler = new Crawler()

await crawler.connect()

await crawler.goto('https://grpfor.sefin.fortaleza.ce.gov.br/grpfor/pages/mensagens/mensagemPesquisa.seam?cid=17552')

await crawler.waitForSelector('#pesquisaForm\\:tituloDec\\:titulo')

await crawler.evaluate(`document.getElementById('pesquisaForm:tituloDec:titulo').value = 'INTIMAÇÃO PARA AUTORREGULARIZAÇÃO'`)

await crawler.click('#pesquisaForm\\:botaoPesquisar')


await crawler.waitForSelector('#pesquisaForm\\:dataTable tbody tr td')
const pages = Array(24).fill("").map((_, i) => String(i + 1))
for await (let p of pages) {
        await crawler.sleep(2000)
        await crawler.waitForFunction((p: string) => {
                return document.querySelector('.rich-datascr-act')?.textContent == p
        }, p)

        console.log('carrego', p)

        const ids: string[] = await crawler.evaluate(() => {

                const ids = Array.from(document.querySelectorAll('a'))
                        .filter(a => a.href.includes('actionOutcome=detalhar'))
                        .map(a => a.href.replace(/.*?id=(\d+).*/, "$1"))
                //https://grpfor.sefin.fortaleza.ce.gov.br/grpfor/pages/mensagens/mensagemPesquisa.seam?id=974914&actionOutcome=detalhar&cid=55669

                const current = document.querySelector('.rich-datascr-act')?.textContent || ''
                const next = Array.from(document.querySelectorAll<HTMLAnchorElement>('.rich-datascr-inact'))
                        .find(pag => pag.textContent == String(parseInt(current) + 1))

                
                next?.click()

                return ids;
        })


      
}



