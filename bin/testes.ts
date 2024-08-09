import { Workbook } from "exceljs";
import { Database } from "../src/libs/database";

const workbook = new Workbook()
const worksheet = workbook.addWorksheet('data')

worksheet.columns = [
    { key: "Seq", header: "SEQ", width: 10 },
    { key: "inscricao", header: "INSCRIÇãO", width: 10, numFmt: `000000"-"0` },
    { key: "CNPJ_MATRIZ", header: "CNPJ MATRIZ", width: 20, numFmt: `00"."000"."000"/"0000"-"00` },
    { key: "NOME", header: "NOME", width: 60 },
    { key: "competencia", header: "COMPETENCIA", width: 10 },
    { key: "faturamento_nfe", header: "FATURAMENTO NFS", width: 10 },
    { key: "faturamento_pgdas", header: "FATURAMENTO PGDAS", width: 10 },
    { key: "faturamento_diferenca", header: "DIFERENÇA FATURAMENTO", width: 10 },
    { key: "iss_nfe", header: "ISS NFS", width: 10 },
    { key: "iss_pgdas", header: "ISS PGDAS", width: 10 },
    { key: "iss_diferenca", header: "DIFERENÇA ISS", width: 10 },
    { key: "Auditor", header: "AUDITOR", width: 10 },
    { key: "Planejamento", header: "PLANEJAMENTO", width: 10 },
    { key: "ULTIMA_PGDAS", header: "ÚLTIMO PGDASD", width: 23 },
]

worksheet.autoFilter = 'A1:N1'

const data = await Database.factory().table('relatorio');

data.forEach((item, i) => {
    worksheet.insertRow(i+2,item)
})

await workbook.xlsx.writeFile('teste.xlsx')
process.exit(0)