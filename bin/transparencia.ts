import { Crawler } from "../src/libs/Crawler"


const meses =  Array(8).fill("").map((_,i) => String(i+1).padStart(2, '0'))

const c = await Crawler.factory()
const items:any[] = []
for await (let mes of meses) {
    await c.goto(`https://transparencia.fortaleza.ce.gov.br/index.php/servidores/consultar?mes=${mes}&ano=2024&nome=&orgao=23101&funcao=&btnConsultar=Consultar`)

    await c.waitForSelector('.resultado');

    const data = await c.evaluate((mes:string) => {
        const resultados = document.querySelectorAll('.resultado');

        return Array.from(resultados)
            .map(res => {
                return {
                    mes,
                    nome: res.querySelector('span>div:nth-child(1)')?.textContent?.replace("Nome: ", ""),
                    cargo: res.querySelector('span>div:nth-child(2)')?.textContent?.replace("Cargo: ", ""),
                }
            })
    }, mes)

   items.push(...data)
}

await Bun.write('servidores.csv', items.map(i => Object.values(i).join("; ")).join("\n"))