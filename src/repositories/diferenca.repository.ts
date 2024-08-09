import { Database } from "../libs/database";

export class DiferencaRepository {
    static async upsert(data:any) {
        const database = Database.factory()

        const item = await database.table('diferenca')
            .where('id', data.id);
        
        if(item.length > 0) {
            await database.table('diferenca')
                .where('id', data.id)
                .update(data)
        } else {
            await database.table('diferenca')
            .insert(data)
        }
    }
}