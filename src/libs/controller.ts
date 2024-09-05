

export class Controller {
    static filename: string = './controle.txt'
    static async add(str: string) {

        const has = await this.has(str)

        if(has) {
            return;
        }

        const file = Bun.file(this.filename);

        if (!await file.exists()) {
            await Bun.write(this.filename, '')
        }

        const text = await file.text()

        await Bun.write(this.filename, `${text}${str}\n`)
    }

    static async getAll() {
        const file = Bun.file(this.filename);

        if (!await file.exists()) {
            await Bun.write(this.filename, '')
        }

        const text = await file.text()

        return text.split('\n');
    }

    static async has(str:string) {
        return (await this.getAll()).includes(str)
    }
}