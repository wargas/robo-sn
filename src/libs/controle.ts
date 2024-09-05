export class Controle {
    static async add(i: string) {
        const file = Bun.file('./controle.txt')
        if (!await file.exists()) {
            await Bun.write('./controle.txt', ``)
        }
        const text = await file.text()
        if(!text.includes(i)) {
            await Bun.write('./controle.txt', `${text}${i}\n`)
        }
    }

    static async getAll(): Promise<string[]>{
        const file = Bun.file('./controle.txt')
        if (!await file.exists()) {
            return [];
        }

        const text = await file.text()

        return text.split('\n');
    }



}