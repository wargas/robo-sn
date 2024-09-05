import { add, addHours, format } from "date-fns";
import { Workbook } from "exceljs";
import { Database } from "../src/libs/database";
import EventEmitter from "eventemitter3";

export class ReadExtrato {

    events = new EventEmitter()

    static factory() {
        return new ReadExtrato();
    }

    async process(filepath: string) {
        try {
            const workbook = new Workbook()

            await workbook.xlsx.readFile(filepath);

            const worksheet = workbook.getWorksheet(1);

            if (!worksheet) {
                process.exit(0)
            }

            let inscricao = '';

            worksheet.getRow(8).eachCell(cell => {
                if (/^\d+\.\d+-\d$/.test(cell.text)) {
                    inscricao = cell.text.replace(/\D/g, "").padStart(7, "0");
                }

            })



            var isSimples = false;

            const regexCompetencia = new RegExp(/^(\d+)\/(\d{4})$/)

            const data: any[] = []

            const cols = {
                competencia: 0,
                data_pagamento: 0,
                das: 0,
                principal: 0,
                multa: 0,
                juros: 0,
                total: 0,
            }

            worksheet.eachRow(row => {
                if (row.getCell("A").text == "Pagamento Simples Nacional") {
                    isSimples = true;
                }


                if (row.getCell("A").text == 'Competência') {
                    row.eachCell(cell => {

                        if (cell.text == "Competência") {
                            cols.competencia = parseInt(cell.col);
                        }
                        if (cell.text == "Dt de Pagto.") {
                            cols.data_pagamento = parseInt(cell.col);
                        }
                        if (cell.text == "DAS") {
                            cols.das = parseInt(cell.col);
                        }
                        if (cell.text == "Principal (R$)") {
                            cols.principal = parseInt(cell.col);
                        }
                        if (cell.text == "Multa (R$)") {
                            cols.multa = parseInt(cell.col);
                        }
                        if (cell.text == "Juros (R$)") {
                            cols.juros = parseInt(cell.col);
                        }
                        if (cell.text == "Total (R$)") {
                            cols.total = parseInt(cell.col);
                        }
                        
                    })
                }
                // process.exit(0)

                if (isSimples && regexCompetencia.test(row.getCell("A").text)) {
                   
                    const data_pagamento = format(addHours(row.getCell(cols.data_pagamento).text, 4), "yyyy-MM-dd")

                   
                    if (data_pagamento >= "2024-07-01") {
                        const competencia = row.getCell(cols.competencia).text.padStart(7, '0').replace(regexCompetencia, "$2-$1");
                        const das = row.getCell(cols.das).text
                        const principal = parseFloat(row.getCell(cols.principal).text)
                        const multa = parseFloat(row.getCell(cols.multa).text)
                        const juros = parseFloat(row.getCell(cols.juros).text)
                        const total = parseFloat(row.getCell(cols.total).text)
                        data.push({
                            inscricao,
                            data_pagamento,
                            competencia,
                            das,
                            principal,
                            multa,
                            juros,
                            total
                        })

                    }
                }

            })

            if (data.length > 0) {
                await Database.factory()
                    .table('extrato')
                    .insert(data)
            }
            this.events.emit('done', { inscricao, filepath })

            return {inscricao, filepath};
        } catch (error) {
            this.events.emit('error', filepath)
        }
        return;
    }

}