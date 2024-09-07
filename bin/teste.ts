import path from 'path';
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
    executablePath: path.join('D:\\projetos\\chrome-win\\chrome.exe'),
    headless: false,
    debuggingPort: 9223,   
})

const p = await b.newPage()

await p.goto("https://www.google.com")

const title = await p.title();

console.log(p.content.length)
