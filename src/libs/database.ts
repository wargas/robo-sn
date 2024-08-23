import knex from "knex";

export class Database {
    static factory() {
        return knex({
            client: 'sqlite3',
            connection: {
                filename: './database/db.sqlite'
            },
            useNullAsDefault: true,
            
        })
    }
}