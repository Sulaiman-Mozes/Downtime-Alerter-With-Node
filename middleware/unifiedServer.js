const url = require('url');
const { StringDecoder } = require('string_decoder');
const Router = require('../routes');
const Handlers = require('../routes/controllers/common');
const authenticate = require('./authenticate')

module.exports = (req, res) => {
  const parseUrl = url.parse(req.url, true);

  const urlPath = parseUrl.pathname;
  const trimmedPath = urlPath.replace(/^\/+|\/+$/g, '');


  const method = req.method.toUpperCase();

  const decoder = new StringDecoder('utf8');

  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {

    buffer += decoder.end();

    res.setHeader('Content-Type', 'application/json');

    req.query = parseUrl.query;

    req.body = JSON.parse(buffer);

    res.status = (statusCode) => {
      res.writeHead(statusCode);
      return ({
        json: data => res.end(typeof data === 'string' ? data : JSON.stringify(data)),
        send: data => res.end(typeof data === 'string' ? data : JSON.stringify(data)),
      });
    }

    const protectedRoute = (route) => {
      return route.protected ? authenticate(req, res, route) : route.controller;
    }

    const exactRoute = (route) => {
      return method === route.method ? protectedRoute(route) : Handlers.methodNotAllowed;
    }

    const correctHandler = typeof (Router[trimmedPath]) !== 'undefined'
      ? exactRoute(Router[trimmedPath]) : Handlers.notFoundHandler;

    correctHandler(req, res);

  });

}
