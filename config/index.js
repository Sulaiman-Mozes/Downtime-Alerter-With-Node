const configVariables = {};

configVariables.production = {
  HTTP_PORT: process.env.PROD_HTTP_PORT,
  HTTPS_PORT: process.env.PROD_HTTPS_PORT,
  ENV_NAME: process.env.PROD_ENV_NAME,
  MAX_CHECKS_LIMIT: process.env.PROD_MAX_CHECKS_LIMIT,
  SECRET_KEY: process.env.PROD_SECRET_KEY,
  TWILIO_ACCOUNT_SID: process.env.PROD_TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.PROD_TWILIO_AUTH_TOKEN,
  TWILIO_NUMBER: process.env.PROD_TWILIO_NUMBER,
  SEND_GRID_API_KEY: process.env.PROD_SEND_GRID_API_KEY,
};

configVariables.staging = {
  HTTP_PORT: process.env.HTTP_PORT,
  HTTPS_PORT: process.env.HTTPS_PORT,
  ENV_NAME: process.env.ENV_NAME,
  MAX_CHECKS_LIMIT: process.env.MAX_CHECKS_LIMIT,
  SECRET_KEY: process.env.SECRET_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_NUMBER: process.env.TWILIO_NUMBER,
  SEND_GRID_API_KEY: process.env.SEND_GRID_API_KEY,

};

const ENV = process.env.NODE_ENV || ''

module.exports = ENV.toLowerCase() !== 'production'
  ? configVariables.staging : configVariables.production;
