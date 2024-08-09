export const FillEscrituracaoCompetencias = () => {
    const inicio = document.getElementById('escrituracaoFiscalAdminForm:dataInicialDiv:competenciaInicialInputDate') as HTMLInputElement;
    const fim = document.getElementById('escrituracaoFiscalAdminForm:dataFinalDiv:competenciaFinalInputDate') as HTMLInputElement;
    if (inicio) {
        inicio.value = '07/2019'
    }
    if (fim) {
        fim.value = '12/2023'
    }

}