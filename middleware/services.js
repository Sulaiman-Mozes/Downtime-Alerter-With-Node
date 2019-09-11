const queryString = require('querystring');
const https = require('https');

const config = require('../config');

module.exports = {

  sendTwilioSms: (phone, message, callback) => {
    if (!(message.length > 0 && message.length <= 1600)) {
      return callback({ msg: message, phone }, null);
    };

    const payload = {
      From: config.TWILIO_NUMBER,
      To: phone,
      Body: message
    }

    const stringPayload = queryString.stringify(payload);

    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}/Messages.json`,
      auth: `${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload),
      }
    }

    const req = https.request(requestDetails, (res) => {
      const statusCode = res.statusCode;

      res.on('data', (d) => {
        return statusCode === 200 || statusCode === 201
          ? callback(false, { data: JSON.parse(d.toString()), statusCode })
          : callback({ err: JSON.parse(d.toString()), statusCode }, null);

      });

    });
    req.on('error', (e) => {
      process.stdout.write(e);
      callback(e, null)
    });

    req.write(stringPayload);

    req.end();
  },

  sendGridEmails: (email, subject, message, callback) => {
    const emailData = JSON.stringify({
      personalizations: [
        {
          to: [
            {
              email,
              name: "Sulaiman"
            }
          ],
          subject
        }
      ],
      content: [
        { "type": "text/plain", "value": message }
      ],
      from: {
        email: "noreply@monitoringapp.com",
        name: "Monitoring App"
      },
      reply_to: {
        email: "noreply@monitoringapp.com",
        name: "Monitoring App"
      }
    })
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.sendgrid.com',
      method: 'POST',
      port: null,
      path: '/v3/mail/send',
      headers: {
        'Authorization': `Bearer ${config.SEND_GRID_API_KEY}`,
        'Content-Length': Buffer.byteLength(emailData),
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(requestDetails, (res) => {
      const statusCode = res.statusCode;

      let chunks = [];

      res.on("data", (chunk) => {
        process.stdout.write(chunk, statusCode);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        return statusCode === 200 || statusCode === 201 || statusCode === 202
          ? callback(null, { body, statusCode })
          : callback({ body, statusCode }, null);
      });

    });
    req.on('error', (e) => {
      process.stdout.write(e);
      callback(e, null)
    });

    req.write(emailData);

    req.end();
  },
}