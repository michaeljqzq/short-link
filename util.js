import fs from 'fs';

let configs = fs.readFileSync('./config.json');

export default JSON.parse(configs);