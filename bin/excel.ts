import { Workbook } from "exceljs";
import { columns } from "../src/config/relatorio-columns";
import { Database } from "../src/libs/database";

const workbook = new Workbook()
const data = await Database.factory().table('relatorio').orderBy('Seq', 'asc');

function addWorksheet(name: string, items:any[]) {
    const worksheet = workbook.addWorksheet(name)

    worksheet.columns = columns

    worksheet.autoFilter = 'A1:N1'

    items.forEach((item, i) => {
        let dataPgdas: string | Date = '-'

        if (item.ULTIMA_PGDAS != "-") {
            dataPgdas = new Date(item.ULTIMA_PGDAS);
            dataPgdas.setHours(dataPgdas.getHours() - 3)
        }

        worksheet.insertRow(i + 2, {
            ...item,
            inscricao: parseInt(item.inscricao),
            CNPJ_MATRIZ: parseInt(item.CNPJ_MATRIZ),
            ULTIMA_PGDAS: dataPgdas
        })
    })

    worksheet.getColumn(2).eachCell(cell => cell.numFmt = `000000"-"0`)
    worksheet.getColumn(3).eachCell(cell => cell.numFmt = `00"."000"."000"/"0000"-"00`)

}

const auditores = [...new Set(data.map(d => d.Auditor))]

addWorksheet('Todos', data);

auditores.forEach(auditor => {
    addWorksheet(auditor, data.filter(d => d.Auditor == auditor));
})


const fileName = new Date().toJSON().split("T")[0]

await workbook.xlsx.writeFile(`./diferenca-${fileName}.xlsx`)
process.exit(0)