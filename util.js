import fs from 'fs';

let configs = fs.readFileSync(__dirname + '/config.json');

export default JSON.parse(configs);