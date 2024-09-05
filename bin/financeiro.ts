import fs from 'fs';
import path from 'path';
import { ReadExtrato } from "../src/read-extrato";
import { Progress } from '../src/libs/Progress';
import { Controle } from '../src/libs/controle';

const reader = ReadExtrato.factory();

const files = fs.readdirSync('./extratos').filter(f => f.endsWith('xlsx'));
const progress = Progress.factory('[{value}/{total}] {bar} | {percentage}% | {duration_formatted} | {inscricao}')

progress.start(files.length, 0)

reader.events.on('done', (data) => {
    progress.increment(1, data);

    Controle.add(data.filepath)
});
reader.events.on('error', (file) => {
    // console.log('error', file)
});

for await (let file of files) {
    // :const all = await Controle.getAll();
    
    await reader.process(path.join('extratos', file))
}

process.exit(0)
