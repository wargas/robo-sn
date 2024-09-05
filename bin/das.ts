import { Crawler } from "../src/libs/Crawler";

const crawler = await Crawler.factory();

await crawler.goto("https://www10.receita.fazenda.gov.br/entessn/app/ATFLA/consultaPagamentos.app/views/ConsultarPagamentos.aspx");

await crawler.waitForSelector('#ContentPlaceHolder1_txtDataArrecadacaoInicial')

await crawler.evaluate(() => {
    const inputData = document.querySelector('#ContentPlaceHolder1_txtDataArrecadacaoInicial') as HTMLInputElement;


})
