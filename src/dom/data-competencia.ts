export function domDataCompetencia() {
    const div = document
        .querySelector<HTMLInputElement>('#escrituracaoFiscalAdminForm\\:abasDiv input')

    if(div) {
        return div.value;
    }

    return ''
}