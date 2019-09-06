const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../.data/');

module.exports = {
  create: (dir, filename, data, callback) => {
    fs.open(`${baseDir}/${dir}/${filename}.json`, 'wx', (err, fileDescriptor) => {
      if (err) {
        return callback(true)
      }
      try {
        const stringData = JSON.stringify(data);
        fs.writeFileSync(fileDescriptor, stringData);
        fs.closeSync(fileDescriptor);
        return callback(false);

      } catch (error) {
        return callback(true);
      }
    });
  },

  read: (dir, filename, callback) => {
    fs.readFile(`${baseDir}/${dir}/${filename}.json`, 'utf8', (err, data) => {
      return err ? callback(true, null) : callback(false, data);
    });
  },

  update: (dir, filename, data, callback) => {
    fs.open(`${baseDir}/${dir}/${filename}.json`, 'r+', (err, fileDescriptor) => {
      if (err) {
        return callback(true)
      }
      try {
        const stringData = JSON.stringify(data);

        fs.ftruncateSync(fileDescriptor);
        fs.writeFileSync(fileDescriptor, stringData);
        fs.closeSync(fileDescriptor);
        return callback(false);

      } catch (error) {
        return callback(true);
      }
    });
  },

  delete: (dir, filename, callback) => {
    fs.unlink(`${baseDir}/${dir}/${filename}.json`, (err) => {
      if (err) {
        return callback(true);
      }
      return callback(false);
    });
  },

  list: (dir, callback) => {
    fs.readdir(`${baseDir}/${dir}/`, (err, data) => {
      if (err) {
        return (err, data);
      }
      const trimmedFiles = [];
      data.forEach(file => {
        trimmedFiles.push(file.replace('.json', ''))
      })
      return callback(err, trimmedFiles);
    });
  }
};
