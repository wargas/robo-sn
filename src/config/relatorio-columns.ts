import type { Column } from "exceljs";

export const columns: Partial<Column>[] =  [
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
    { key: "diferenca_anterior", header: "DIFERENÇA INICIAL", width: 10 },
    { key: "Auditor", header: "AUDITOR", width: 10 },
    { key: "Planejamento", header: "PLANEJAMENTO", width: 13 },
    { key: "ULTIMA_PGDAS", header: "ÚLTIMO PGDASD", width: 11 },
]