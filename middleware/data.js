const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../.data');

module.exports = {
  create: (dir, filename, data) => new Promise((resolve, reject) => {
    fs.open(`${baseDir}/${dir}/${filename}.json`, 'wx', (err, fileDescriptor) => {
      if (err) {
        resolve(err)
      }
      try {
        const stringData = JSON.stringify(data);
        const res = fs.writeFileSync(fileDescriptor, stringData);
        fs.closeSync(fileDescriptor);
        resolve(res);

      } catch (error) {
        reject(error);
      }
    })
  }),

  read: (dir, filename) => new Promise((resolve, reject) => {
    fs.readFile(`${baseDir}/${dir}/${filename}.json`, 'utf8', (err, data) => {
      err ? reject(err) : resolve(data);
    });
  }),

  update: (dir, filename, data) => new Promise((resolve, reject) => {
    fs.open(`${baseDir}/${dir}/${filename}.json`, 'r+', (err, fileDescriptor) => {
      if (err) {
        reject(err)
      }
      try {
        const stringData = JSON.stringify(data);

        fs.ftruncateSync(fileDescriptor);
        const res = fs.writeFileSync(fileDescriptor, stringData);
        fs.closeSync(fileDescriptor);
        return resolve(res);

      } catch (error) {
        return reject(err)
      }
    });
  }),

  delete: (dir, filename) => new Promise((resolve, reject) => {
    fs.unlink(`${baseDir}/${dir}/${filename}.json`, (err) => {
      err ? reject(err) : resolve('succesfull');
    });
  }),

  list: (dir) => new Promise((resolve, reject) => {
    fs.readdir(`${baseDir}/${dir}/`, (err, data) => {
      if (err) {
        reject(err);
      }
      const trimmedFiles = [];
      data.forEach(file => {
        trimmedFiles.push(file.replace('.json', ''))
      })
      return resolve(trimmedFiles);
    });
  })
};
