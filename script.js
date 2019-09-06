const fs = require('fs');
const _data = '.data';
const _checks = '.data/checks';
const _users = '.data/users';
const keys = 'keys';

const createDataDirs = (dir) => !fs.existsSync(dir) && fs.mkdirSync(dir);

createDataDirs(_data);
createDataDirs(_checks);
createDataDirs(_users);
createDataDirs(keys);
