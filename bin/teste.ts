
import { Database } from "../src/libs/database";

const db = Database.factory()

db.on('query', (q) => {
    console.log(q.sql)
})

const db2 = Database.factory()


// console.log(db.ref(''))