import { Database } from "../libs/database"

type Pgdas = any

export class PgdasRepository {

    static async getInscricoes() {
        const database = Database.factory()

        return (await database.table('pgdas')
            // .where('data_transmissao', '>=', '2024-08-09')
            .groupBy('inscricao').select('inscricao')).map(i => i.inscricao)
    }

    static async createOne(data: Pgdas) {
        const database = Database.factory()
        const has = await database.table('pgdas').where('id', data.id)


        if(has.length == 0) {
            await database.table('pgdas').insert(data)
        }
    }

    static async createMany(data: Pgdas[]) {
        const database = Database.factory()

        await database.table('pgdas').insert(data)
            .onConflict('id').ignore()
    }

 

}