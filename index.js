const Worker = require('./workers');
const server = require('./server');

const worker = new Worker;

const app = {};

app.init = () => {
  worker.init()
  server.init()
}

app.init();

module.exports = app;
