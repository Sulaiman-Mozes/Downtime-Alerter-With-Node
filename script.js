const fs = require('fs');

const _data = '.data';
const _checks = '.data/checks';
const _users = '.data/users';
const keys = 'keys';
const _logs = '.logs';
const _compressed = '.logs/compressed';
const _uncompressed = '.logs/uncompressed';

const createDataDirs = (dir) => !fs.existsSync(dir) && fs.mkdirSync(dir);

createDataDirs(_data);
createDataDirs(_checks);
createDataDirs(_users);
createDataDirs(keys);
createDataDirs(_logs);
createDataDirs(_compressed);
createDataDirs(_uncompressed);
