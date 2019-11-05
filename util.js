import fs from 'fs';
import path from 'path';

let configs = fs.readFileSync('/etc/short-link/config.json');

export default JSON.parse(configs);