import { Workbook } from "exceljs";
import path from 'path';
import { parseArgs } from 'util';
import { columns } from "../src/config/relatorio-columns";
import { Database } from "../src/libs/database";

const args = parseArgs({
    args: Bun.argv,
    options: {
        outDir: {
            type: 'string',
            short: 'o',
            default: '.'
        }
    },
    allowPositionals: true
})


const workbook = new Workbook()
await workbook.xlsx.readFile(`./modelos/relatorio.xlsx`)

const data = await Database.factory()
    .table('relatorio')
    .orderBy('Seq', 'asc');

function insertData(name: string, items:any[]) {
    const worksheet = workbook.getWorksheet(name)

    if(!worksheet) {
        return;
    }

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
            ULTIMA_PGDAS: dataPgdas,
            competencia: new Date(`${item.competencia}-01`)
        })
    })

    worksheet.getColumn(2).eachCell(cell => cell.numFmt = `000000"-"0`)
    worksheet.getColumn(3).eachCell(cell => cell.numFmt = `00"."000"."000"/"0000"-"00`)
    worksheet.getColumn(5).eachCell(cell => cell.numFmt = 'mm/yyy')

}

insertData('Todos', data);

const fileName = `diferenca-${new Date().toJSON().split("T")[0]}.xlsx`

console.time('Tempo de Execução')
await workbook.xlsx.writeFile(path.join(args.values.outDir || '', fileName))
console.timeEnd('Tempo de Execução')
