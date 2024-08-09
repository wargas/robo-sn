export function domGetDataPGdas() {
    if (!!document.querySelector('.alert-warning') || !!document.querySelector('.alert-danger li')) {
        return []
    }


    const trs =Array.from(document.querySelectorAll('table.consulta:not(#tributos-extrato-malha) tr'))

    const pa = { name: '' }
    const items:any = []
    trs.forEach(tr => {
        const tds = tr.querySelectorAll('td')
        const ths = tr.querySelectorAll('th')
        if (ths.length == 1) {
            pa.name = ths[0].textContent||''
        }

        if (tds.length == 11 && (tds[1].textContent||'').length > 0) {

            items.push({
                pa: pa.name,
                operacao: tds[0].textContent,
                num_declaracao: tds[1].textContent,
                data_transmissao: tds[2].textContent?.replace(/(\d+)\/(\d+)\/(\d+) (.*)/, "$3-$2-$1 $4"),
            })
        }

    })

    return items;
}