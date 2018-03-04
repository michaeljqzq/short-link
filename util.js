import fs from 'fs';
import path from 'path';

let configs = fs.readFileSync(path.resolve(__dirname, 'config.json'));

export default JSON.parse(configs);