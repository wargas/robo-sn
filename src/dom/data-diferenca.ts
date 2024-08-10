export const domDataDiferenca = (im: string) => {
    //escrituracaoFiscalAdminForm:abaEspelhoSimplesNacionalForm:dataTableEspelhoSimplesNacional
    const trs = document.querySelectorAll('#escrituracaoFiscalAdminForm\\:abaEspelhoSimplesNacionalForm\\:dataTableEspelhoSimplesNacional tfoot tr td')
    const competencia = String(document.querySelector<HTMLInputElement>('#escrituracaoFiscalAdminForm\\:abasDiv input')?.value || '')
        .padStart(7, "0")
        .replace(/(\d+)\/(\d+)/, "$2-$1")

    /**
     * 
     * @param {string} text 
     * @returns {number}
     */
    function toNumber(text:string) {
        return parseFloat(text.replace(/\./g, "")
            .replace(/\,/g, ".")) || 0
    }

    return {
        id: `${im}:${competencia}`,
        inscricao: im,
        competencia,
        faturamento_nfe: toNumber(trs[2]?.textContent||''),
        faturamento_pgdas: toNumber(trs[3]?.textContent||''),
        faturamento_diferenca: toNumber(trs[4]?.textContent||''),
        iss_nfe: toNumber(trs[5]?.textContent||''),
        iss_pgdas: toNumber(trs[6]?.textContent||''),
        iss_diferenca: toNumber(trs[7]?.textContent||''),
    }
}