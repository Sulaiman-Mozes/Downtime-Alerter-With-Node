const os = require('os');
const cluster = require('cluster');
const https = require('https');
const http = require('http');
const URL = require('url');
const _data = require('./middleware/data');
const _logs = require('./middleware/logs')
const services = require('./middleware/services');

module.exports = function () {
  this.init = () => {
    this.loop();
    this.startChecks();
    this.logRotationLoop();
  };

  this.runAllChecks = (data) => {
    data.forEach(async (check) => {
      try {
        const checkdata = await _data.read('checks', check);
        this.performCheck(JSON.parse(checkdata));
      } catch (error) {
        throw error
      }
    })
  };

  this.splitChecksToWorkers = (arr, n) => {
    const rest = arr.length % n;
    let restUsed = rest
    const partLength = Math.floor(arr.length / n);
    const result = [];

    for (let i = 0; i < arr.length; i += partLength) {
      let end = partLength + i,
        add = false;

      if (rest !== 0 && restUsed) {
        end++;
        restUsed--;
        add = true;
      }
      result.push(arr.slice(i, end));

      if (add) {
        i++;
      }
    }

    return result;
  };

  this.performCheck = async (checkData) => {
    const { protocol, url, method, timeoutSeconds } = checkData;

    const outcomeObject = {
      error: null,
      statusCode: null
    }
    const resultSent = false;

    const parsedUrl = URL.parse(`${protocol}://${url}`);
    const hostname = parsedUrl.hostname;
    const urlpath = parsedUrl.path;

    const requestObject = {
      protocol: `${protocol}:`,
      method,
      hostname,
      path: urlpath,
      timeout: timeoutSeconds,
    }

    const _moduleToUse = protocol === 'http' ? http : https;

    let chunks = [];

    const req = _moduleToUse.request(requestObject, (res) => {
      outcomeObject.statusCode = res.statusCode;

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        if (!resultSent) {
          this.processCheckOutcome(checkData, outcomeObject);
        }
      });
    });

    req.on('error', (e) => {
      outcomeObject.error = {
        'error': true,
        'value': e
      }
      if (!resultSent) {
        this.processCheckOutcome(checkData, outcomeObject);
      }
    });

    req.on('timeout', () => {
      outcomeObject.error = {
        'error': true,
        'value': 'timeout'
      }
      if (!resultSent) {
        this.processCheckOutcome(checkData, outcomeObject);
      }
    });

    req.end()

  };

  this.log = async (logData) => {
    const fileName = logData.checkId;
    try {
      await _logs.append(fileName, JSON.stringify(logData));
    } catch (error) {
      console.log(error, 'unable to append logs')
    }
  };

  this.processCheckOutcome = async (checkData, outComeData) => {
    const { email, checkId, successCode, url, protocol, status, method } = checkData;
    const state = outComeData.statusCode && outComeData.statusCode === successCode ? 'up' : 'down';
    const alertWanted = status !== state ? true : false

    if (alertWanted) {
      const message = `This is to inform you that your website
      ${protocol}://${url} is now up`

      services.sendGridEmails(email, "Website is up", message, (error, data) => {
        if (error) console.log(error);
      });
    }
    const newCheckdata = checkData;
    newCheckdata.status = state;
    newCheckdata.lastChecked = Date.now();

    const logObject = {
      ...outComeData, checkId, url: `${protocol}://${url}`, state, alert: alertWanted,
      timeOfCheck: newCheckdata.lastChecked, user: email, method
    }

    await _data.update('checks', checkId, newCheckdata);

    this.log(logObject);
  };

  this.startChecks = async () => {
    try {
      const data = await _data.list('checks');
      if (data.length > 0) {

        const arr = this.splitChecksToWorkers(data, os.cpus().length);
        for (const id in cluster.workers) {
          arr[id - 1] && arr[id - 1].length > 0 && this.runAllChecks(arr[id - 1])
        }
      } else {
        console.log('not checks to process at the moment')
      }
    } catch (error) {
      throw error
    }
  }

  this.rotateLogs = async () => {
    try {
      const logs = await _logs.list(false);

      const compressLogs = (logs) => logs.length > 0 && logs.forEach(async log => {
        const newLogId = `${log}-${new Date().toJSON().replace(/:/g, '-')}`
        await _logs.compress(log, newLogId);
        await _logs.truncate(log);
      });

      if (logs.length > 0) {
        const arr = this.splitChecksToWorkers(logs, os.cpus().length);
        for (const id in cluster.workers) {
          arr[id - 1] && arr[id - 1].length > 0 && compressLogs(arr[id - 1]);
        }
      }

    } catch (error) {
      console.log(`Error in compressing one of files`)
    }
  }

  this.loop = () => {
    setInterval(() => {
      this.startChecks();
    }, 1000 * 60);
  };

  this.logRotationLoop = () => {
    setInterval(() => {
      this.rotateLogs();
    }, 1000 * 60 * 60 * 24);
  };
}
