const configVariables = {};

configVariables.staging = {
  HTTP_PORT: 3000,
  HTTPS_PORT: 3001,
  ENV_NAME: 'staging',
  MAX_CHECKS_LIMIT: 5,
  SECRET_KEY: "",
  TWILIO_ACCOUNT_SID: "",
  TWILIO_AUTH_TOKEN: "",
  TWILIO_NUMBER: "",
  SEND_GRID_API_KEY: "",
};

configVariables.production = {
  HTTP_PORT: 5000,
  HTTPS_PORT: 5001,
  ENV_NAME: 'production',
  MAX_CHECKS_LIMIT: 5,
  SECRET_KEY: "",
  TWILIO_ACCOUNT_SID: "",
  TWILIO_AUTH_TOKEN: "",
  TWILIO_NUMBER: "",
  SEND_GRID_API_KEY: "",

};

const ENV = process.env.NODE_ENV || ''

module.exports = ENV.toLowerCase() !== 'production'
  ? configVariables.staging : configVariables.production;
