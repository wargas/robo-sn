import { Crawler } from "../src/libs/Crawler";
import { Paginate } from "../src/libs/Paginate";

const crawler = await Crawler.factory();

await crawler.goto('https://issadmin.sefin.fortaleza.ce.gov.br/grpfor/pages/simplesNacional/relatorios/declaracaoPagamentoSNA.seam');

await crawler.type('#pesquisaForm\\:searchFilter\\:inscricaoDec\\:inscricao', '2911086')

await crawler.evaluate(() => {
    const inputStart = document.getElementById('pesquisaForm:searchFilter:competenciaInicial:competenciaInicialDtInputDate') as HTMLInputElement

    if (inputStart) {
        inputStart.value = "07/2019"
    }

    const inputEnd = document.getElementById('pesquisaForm:searchFilter:competenciaFinal:competenciaFinalDtInputDate') as HTMLInputElement

    if (inputStart) {
        inputEnd.value = "12/2023"
    }


})

await crawler.click('[value="Emitir Relatório"]')

await crawler.waitForSelector('.rich-datascr-act,.rich-datascr-inact')



const paginate = new Paginate(crawler)

const pages = await paginate.getPages();

const items = [];

for await (let page of pages) {
    await paginate.gotTo(page);
    await Bun.sleep(200);
    const data = await crawler.evaluate(() => {
        return Array.from(document.querySelectorAll('#pesquisaForm\\:dataTable tbody tr'))
            .map(row => {
                const tds = row.querySelectorAll('td')
                return {
                    competencia: tds[0].textContent,
                    sinac: tds[1].textContent,
                    receita_bruta: tds[2].textContent,
                    rec_serv_iss_fora: tds[3].textContent,
                    rec_serv_iss_fortal: tds[4].textContent,
                    bc_iss_retido: tds[5].textContent,
                    iss_fixo_serv_contabeis: tds[6].textContent,
                    bc_iss_proprio: tds[7].textContent,
                    iss_devido: tds[8].textContent,
                    iss_recolhido: tds[9].textContent,
                    iss_parcelado: tds[10].textContent,
                    situacao_parcelamento: tds[11].textContent,
                    diferenca: tds[12].textContent,
                }
            })
    })

    items.push(...data)

}

await Bun.write('result.json', JSON.stringify(items))

process.exit(0)

//#pesquisaForm:searchFilter:competenciaInicial:competenciaInicialDtInputDate