const commonController = require('./controllers/common');
const checksController = require('./controllers/checks');
const userController = require('./controllers/users');

module.exports = {
  'ping': { method: 'GET', controller: commonController.ping },

  'users/register': { method: 'POST', controller: userController.create },

  'users/login': { method: 'POST', controller: userController.login },

  'users/list': { method: 'GET', protected: true, controller: userController.list },

  'users/update': { method: 'PUT', protected: true, controller: userController.update },

  'users/get': { method: 'GET', protected: true, controller: userController.get },

  'checks/create': { method: 'POST', protected: true, controller: checksController.create },

  'checks/list': { method: 'GET', protected: true, controller: checksController.list },

  'checks/get': { method: 'GET', protected: true, controller: checksController.get },

  'checks/delete': { method: 'DELETE', protected: true, controller: checksController.delete },

  'checks/update': { method: 'PUT', protected: true, controller: checksController.update },
}
