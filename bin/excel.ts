import { Workbook } from "exceljs";
import { Database } from "../src/libs/database";

const workbook = new Workbook()
const worksheet = workbook.addWorksheet('data')

worksheet.columns = [
    { key: "Seq", header: "SEQ", width: 5 },
    { key: "inscricao", header: "INSCRIÇãO", width: 10, numFmt: `000000"-"0` },
    { key: "CNPJ_MATRIZ", header: "CNPJ MATRIZ", width: 20, numFmt: `00"."000"."000"/"0000"-"00` },
    { key: "NOME", header: "NOME", width: 50 },
    { key: "competencia", header: "COMPETENCIA", width: 10 },
    { key: "faturamento_nfe", header: "FATURAMENTO NFS", width: 10 },
    { key: "faturamento_pgdas", header: "FATURAMENTO PGDAS", width: 10 },
    { key: "faturamento_diferenca", header: "DIFERENÇA FATURAMENTO", width: 10 },
    { key: "iss_nfe", header: "ISS NFS", width: 10 },
    { key: "iss_pgdas", header: "ISS PGDAS", width: 10 },
    { key: "iss_diferenca", header: "DIFERENÇA ISS", width: 10 },
    { key: "Auditor", header: "AUDITOR", width: 10 },
    { key: "Planejamento", header: "PLANEJAMENTO", width: 13 },
    { key: "ULTIMA_PGDAS", header: "ÚLTIMO PGDASD", width: 11 },
]

worksheet.autoFilter = 'A1:N1'

const data = await Database.factory().table('relatorio').orderBy('Seq', 'asc');

data.forEach((item, i) => {
    let dataPgdas: string|Date = '-'

    if(item.ULTIMA_PGDAS != "-") {
        dataPgdas = new Date(item.ULTIMA_PGDAS);
        dataPgdas.setHours(dataPgdas.getHours() - 3)
    }

    worksheet.insertRow(i+2, {
        ...item,
        inscricao: parseInt(item.inscricao),
        CNPJ_MATRIZ: parseInt(item.CNPJ_MATRIZ),
        ULTIMA_PGDAS: dataPgdas
    })
})

worksheet.getColumn(2).eachCell(cell => cell.numFmt = `000000"-"0`)
worksheet.getColumn(3).eachCell(cell => cell.numFmt = `00"."000"."000"/"0000"-"00`)

const fileName = new Date().toJSON().split("T")[0]

await workbook.xlsx.writeFile(`//auriga/CGISS/WARGAS/diferenca-${fileName}.xlsx`)
process.exit(0)