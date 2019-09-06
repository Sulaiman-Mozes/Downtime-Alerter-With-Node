const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const config = require('../config');

const secret = Buffer.from(config.SECRET_KEY).toString('base64');

const key = fs.readFileSync(path.join(__dirname, '../keys/private.pem'));

const validTokenRegex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

const validUrl = new RegExp(/^(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/);

const base64UrlDecodeToJSON = (str) => JSON.parse(
  Buffer.from(
    str.replace(/-/g, '+').replace(/_/g, '/'), 'base64'
  ).toString('utf8')
);

module.exports = {
  hash: (password) => {

    const salt = crypto.randomBytes(16).toString('hex');

    const passwordHash = crypto.pbkdf2Sync(password, salt,
      1000, 64, `sha512`).toString(`hex`);
    return { salt, passwordHash };
  },

  verify: (salt, hash, password) => {
    const verifyHash = crypto.pbkdf2Sync(password,
      salt, 1000, 64, `sha512`).toString(`hex`);
    return verifyHash === hash;
  },
  createToken: (payload, expiresIn) => {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    let date = new Date();
    date.setMinutes(date.getMinutes() + expiresIn)
    payload.exp = date.getTime();


    const base64UrlEncodeJSON = (json) => {
      return Buffer.from(
        JSON.stringify(json)
      ).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    /*
    Using Asymmetric Keys
    */

    // const generateSignature = (str, privateKey) => {
    //   const sign = crypto.createSign('RSA-SHA256')
    //   sign.update(str)
    //   return sign.sign(privateKey, 'base64')
    //     .replace(/\+/g, '-')
    //     .replace(/\//g, '_')
    //     .replace(/=+$/, '');
    // }

    /*
     Using Symmetric Keys
     */

    const generateSignature = (str, secret) => {
      return crypto
        .createHmac('sha256', secret)
        .update(str)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    const encodedHeaderInBase64 = base64UrlEncodeJSON(header);
    const encodedPayloadInBase64 = base64UrlEncodeJSON(payload);
    const encodedSignatureInBase64 = generateSignature(`${encodedHeaderInBase64}.${encodedPayloadInBase64}`, secret);
    return `${encodedHeaderInBase64}.${encodedPayloadInBase64}.${encodedSignatureInBase64}`;
  },

  verifyToken: (token) => {
    const parts = token.split('.')

    const header = base64UrlDecodeToJSON(parts[0]);
    const payload = base64UrlDecodeToJSON(parts[1]);
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {

      return false
    }

    const generateSignature = (str, secret) => {
      return crypto
        .createHmac('sha256', secret)
        .update(str)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    const signature = parts[2]
    const exp = payload.exp

    if (exp) {
      if (exp < new Date().getTime()) {

        return false
      }
    }

    return generateSignature(`${parts[0]}.${parts[1]}`, secret) === signature
  },

  decodedToken: (token) => {
    const parts = token.split('.');
    return base64UrlDecodeToJSON(parts[1]);
  },

  checkUrl: (url) => url.match(validUrl),
}
