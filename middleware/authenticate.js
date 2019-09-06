const middleware = require('./common');
const Handlers = require('../routes/controllers/common')

module.exports = (req, res, route) => {

  const { authorization } = req.headers;

  if (!authorization) {
    req.error = { msg: "Token is Not Provided" };
    return Handlers.authenticateErrorHandler;
  }

  const token = authorization.split(" ");
  const newtoken = token.length > 1 ? token[1] : token[0];

  if (!middleware.verifyToken(newtoken)) {
    req.error = { msg: "Invalid or Expired Token" }
    return Handlers.authenticateErrorHandler;
  };


  req.user_data = middleware.decodedToken(newtoken);

  return route.controller;
}