import { Crawler } from "../src/libs/Crawler";
import { Paginate } from "../src/libs/Paginate";

const crawler = await Crawler.factory()

await crawler.goto('https://issadmin.sefin.fortaleza.ce.gov.br/grpfor/pages/cpbs/consultarCPBS/consultarCPBSPesquisa.seam')

await crawler.waitForSelector('#pesquisaForm\\:cnaeCodigoDec\\:cnae')

await crawler.evaluate(() => {
    const input = document.querySelector('#pesquisaForm\\:cnaeCodigoDec\\:cnae') as HTMLInputElement;
    const radio = document.querySelector('[value="J"]') as HTMLButtonElement;
    const button = document.querySelector('#pesquisaForm\\:botaoPesquisar') as HTMLButtonElement;

    input.value = '452000501'
    radio.click()
    button.click()
})

const paginate = new Paginate(crawler)

const registros:any[] = []

await paginate.forEach(async(p) => {
    await crawler.waitForSelector('#pesquisaForm\\:dataTable\\:tb')
    const data = await crawler.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#pesquisaForm\\:dataTable\\:tb tr'))

        const items = rows.map(row => {
            const cells = row.querySelectorAll('td')

            return {
                cpbs_id: cells[6].outerHTML.replace(/\n/g, " ").replace(/.*idDetalharHistoricoCPBS=(\d+).*/, "$1"),
                inscricao: cells[0].textContent,
                situacao: cells[1].textContent,
                documento: cells[2].textContent,
                nome: cells[3].textContent,
            }
        })

        document.querySelector('#pesquisaForm\\:dataTable\\:tb')?.remove()        

        return items;
        
    })

    console.log(p)

    registros.push(...data)
    
})


await Bun.write('data.json', JSON.stringify(registros))