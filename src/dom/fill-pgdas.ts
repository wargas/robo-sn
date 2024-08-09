export function domFillPgdass(cnpj: string, ano: string) {
    const divCnpj = document.getElementById('cnpj-porano') as HTMLInputElement
    const divAno = document.getElementById('ano-porano') as HTMLInputElement

    if(divCnpj) {
        divCnpj.value = cnpj
    }
    if(divAno) {
        divAno.value = ano
    }
}