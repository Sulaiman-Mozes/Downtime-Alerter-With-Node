const cluster = require('cluster');
const http = require('http');
const https = require('https')
const fs = require('fs');
const os = require('os')
const config = require('./config');
const unifiedServer = require('./middleware/unifiedServer');

const options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
};

const httpsServer = https.createServer(options, (req, res) => {
  unifiedServer(req, res)
})

const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

const addCluster = () => {
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      if (code != 0 && !worker.exitedAfterDisconnect) {
        console.log(`Worker ${worker.id} crashed. Starting new worker .......`);
        cluster.fork();
      }
    });

    cluster.on('online', (worker) => {
      console.log(`worker ${worker.process.pid} is online`);
    });
  } else {


    httpServer.listen(config.HTTP_PORT, () => console.log(`http server running on port ${config.HTTP_PORT}`));
    httpsServer.listen(config.HTTPS_PORT, () => console.log(`https server running on port ${config.HTTPS_PORT}`));

    console.log(`Worker ${process.pid} started`);
  }
}

module.exports = {
  init: () => {
    addCluster();
  }
}
