// import { Crawler } from "./libs/Crawler";
// import { dateToSQL } from "./libs/Helper";
// import prisma from "./libs/Prisma";

// const intimacoes = await prisma.intimacao.findMany({
//     select: {
//         id: true
//     }
// })

// const crawler = new Crawler()

// await crawler.connect()

// for await (let intimacao of intimacoes) {
//     await crawler.goto(`https://grpfor.sefin.fortaleza.ce.gov.br/grpfor/pages/mensagens/certificadoCienciaPopup.seam?idMensagem=${intimacao.id}`)

//     const data = await crawler.evaluate((id:string) => {
//         const tdsSP = document.querySelectorAll('#cienciaForm\\:j_id25_body td')
//         const tdsDOC = document.querySelectorAll('#cienciaForm\\:j_id34_body td')

//         const data: any = {}

//         if (tdsSP.length > 5) {
//             return {
//                 id: id,
//                 nome: tdsSP[1].textContent,
//                 cnpj: tdsSP[3].textContent?.replace(/\D/g, ""),
//                 inscricao: tdsSP[5].textContent?.replace(/\D/g, ""),
//                 data_ciencia: dateToSQL(tdsDOC[3].textContent||''),
//                 usuario: tdsDOC[7].textContent
//             }
//         }

//         return null;

//     }, intimacao.id)

//     if (data) {

//         await prisma.intimacao.update({
//             where: {
//                 id: data.id
//             },
//             data
//         })
//     }

// }