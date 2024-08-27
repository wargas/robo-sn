import { Database } from "../libs/database"
import { format } from 'date-fns'

type Pgdas = any

export class PgdasRepository {

    static async getInscricoes(start: Date) {
        const database = Database.factory()

        return (await database.table('pgdas')
<<<<<<< HEAD
            // .where('data_transmissao', '>=', '2024-08-09')
=======
            .where('data_transmissao', '>=', format(start, 'yyyy-MM-dd'))
>>>>>>> 2e3024e00f490fe4e1d4c81ef44863c0812b6818
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