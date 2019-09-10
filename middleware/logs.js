const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

const baseDir = path.join(__dirname, '../.logs/uncompressed/');
const compressedBaseDir = path.join(__dirname, '../.logs/compressed/')

module.exports = {
  append: (filename, logData) => new Promise(async (resolve, reject) => {
    let fd;
    try {
      fd = fs.openSync(`${baseDir}${filename}.log`, 'a');
      fs.appendFileSync(fd, `${logData}\n`, 'utf8');
      resolve('successfull');
    } catch (err) {
      reject(err);
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
    }
  }),

  list: (compressed) => new Promise(async (resolve, reject) => {
    try {
      const data = fs.readdirSync(compressed ? compressedBaseDir : baseDir);
      const trimmedFiles = [];
      const fileExtension = compressed ? '.gz.b64' : '.log';
      data.length > 0 && data.forEach(file => {
        trimmedFiles.push(file.replace(fileExtension, ''));
      })
      resolve(trimmedFiles);
    } catch (error) {
      reject(error);
    }
  }),

  truncate: (logId) => new Promise(async (resolve, reject) => {
    try {
      fs.truncateSync(`${baseDir}${logId}.log`)
      resolve("successfull")
    } catch (error) {
      reject(error);
    }
  }),

  compress: (logId, newLogId) => new Promise(async (resolve, reject) => {
    let fd;
    try {
      const data = fs.readFileSync(`${baseDir}${logId}.log`, 'utf-8');
      const buffer = zlib.gzipSync(data);
      fd = fs.openSync(`${compressedBaseDir}${newLogId}.gz.b64`, 'wx');
      fs.writeFileSync(fd, buffer.toString('base64'));
      resolve("successfull");
    } catch (error) {
      reject(error);
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
    }
  }),

  decompress: (logId) => new Promise(async (resolve, reject) => {
    try {
      const str = fs.readFileSync(`${compressedBaseDir}${logId}.gz.b64`, 'utf-8');
      const inputBuffer = Buffer.from(str, 'base64');
      const data = zlib.unzipSync(inputBuffer);
      resolve(data.toString());
    } catch (error) {
      reject(error);
    }
  }),
}