export function domDataCompetencia() {
    const div = document.querySelector<HTMLInputElement>('#escrituracaoFiscalAdminForm\\:j_id665 input')

    if(div) {
        return div.value;
    }

    return ''
}