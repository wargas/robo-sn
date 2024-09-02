import { Crawler } from '../src/libs/Crawler';
import { Login } from '../src/libs/Login';

const crawler = await Crawler.factory()
const login = new Login(crawler);

await login.login();

console.log('logou')