import { PgdasRepository } from "../src/repositories/pgdas.repository";

await PgdasRepository.createOne({
    id: 'wargas',
    num_declaracao: '123'
})

console.log('fim')