
import { Database } from "../libs/database";

export class DataRepository {
    static async getFromInscricoes(inscricoes: string[]) {
        const database = Database.factory()

        return  await database.table('data').whereIn('CPBS', inscricoes)
    }

    static async findAll() {
        const database = Database.factory()
        return  await database.table('data')
    }
}