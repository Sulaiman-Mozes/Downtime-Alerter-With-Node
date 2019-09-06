const path = require('path');
const fs = require('fs');
const os = require('os');
const cluster = require('cluster');
const https = require('https');
const http = require('http');
const URL = require('url');
const _data = require('./middleware/data');
const services = require('./middleware/services');

module.exports = function () {
  this.init = () => {
    this.loop();
    this.startChecks();
  };

  this.runAllChecks = (data) => {
    data.forEach(check => {
      _data.read('checks', check, (err, checkdata) => {
        if (checkdata) {
          this.performCheck(JSON.parse(checkdata));
        } else {
          console.log(err, check)
        }
      });
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

  this.performCheck = (checkData) => {
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

    const req = _moduleToUse.request(requestObject, (res) => {
      outcomeObject.statusCode = res.statusCode
      res.on('data', (d) => {
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

  this.processCheckOutcome = (checkData, outComeData) => {
    const { email, checkId, successCode, url, protocol, status } = checkData;
    const state = outComeData.statusCode && outComeData.statusCode === successCode ? 'up' : 'down';
    const alertWanted = status !== state ? true : false
    if (alertWanted) {
      const message = `This is to inform you that your website
      ${protocol}://${url} is now up`

      services.sendGridEmails(email, " Website is up", message, (error, data) => {
        if (error) throw error;
      });
    }
    const newCheckdata = checkData;
    newCheckdata.status = state;
    newCheckdata.lastChecked = Date.now();

    _data.update('checks', checkId, newCheckdata, (err, data) => {
      if (err) throw err;
    });
  };

  this.startChecks = () => {
    _data.list('checks', (error, data) => {
      if (data && data.length > 0) {

        const arr = this.splitChecksToWorkers(data, os.cpus().length);
        for (const id in cluster.workers) {
          this.runAllChecks(arr[id - 1]);
        }

      } else {
        console.log('not checks to process at the moment')
      }
    });
  }

  this.loop = () => {
    setInterval(() => {
      this.startChecks()
    }, 1000 * 60);
  };
}
