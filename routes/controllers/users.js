const _data = require('../../middleware/data');
const middleWare = require('../../middleware/common');
const { stringValidator, boolValidator,
  emailValidator } = require('../../middleware/validator');

module.exports = {
  create: (req, res) => {
    const { username, password, email, tosAgreement } = req.body;

    if (!stringValidator(username) || !stringValidator(password) || !stringValidator(email)
      || !boolValidator(tosAgreement)) {
      return res.status(400).json({ err: 'All Feilds are Required' });
    }

    _data.read('users', email, (err, data) => {
      if (data) {
        return res.status(400).json({ err: "user account already exists" });
      }

      const { passwordHash, salt } = middleWare.hash(password);
      const userObject = {
        username: username.trim(),
        email: email.trim(),
        password: passwordHash,
        salt,
        tosAgreement,
        checks: [],
      }
      _data.create('users', email, userObject, (err) => {
        if (err) {
          return res.status(500).json({
            err: "unable to create user account, try again later"
          });
        }
        return res.status(201).json({
          user: { username, email }, msg: "Account successfully created"
        });
      })
    });

  },
  login: (req, res) => {
    const { password, email } = req.body;

    if (!stringValidator(email) || !stringValidator(password)) {
      return res.status(400).json({ err: 'All Feilds are Required' });
    }

    _data.read('users', email, (err, data) => {
      if (err && !data) {
        return res.status(400).json({ err: "Authentication Failed, inavlid email or password" });
      }
      data = JSON.parse(data);

      const token = middleWare.createToken({ email: data.email, username: data.username }, 1440);

      const userObject = {
        email: data.email,
        username: data.email,
        token
      }
      return middleWare.verify(data.salt, data.password, password) !== true
        ? res.status(400).json({ err: "Authentication Failed, invalid email or password" })
        : res.status(200).json(userObject);
    });
  },

  delete: (req, res) => {
    const { email } = req.user_data;

    _data.read('users', email, (err, data) => {
      if (err && !data) {
        return res.status(404).json({ err: "user doesnot exist" });
      }
      _data.delete('users', email, (error) => {
        if (error) {
          return res.status(500).json({ msg: "unable delete user account" });
        }
        return res.status(204).json({ msg: "user account delete successfully" });
      });
    });
  },

  get: (req, res) => {

    const { email } = req.user_data;

    _data.read('users', email, (err, data) => {
      if (err) {
        return res.status(404).json({ err: "user doesnot exist" });
      }
      return res.status(200).json(data);
    });
  },
  list: (req, res) => {
    _data.list('users', (err, data) => {
      if (err) {
        return res.status(500).json({ err: "unable to get all users" });
      }
      return res.status(200).json(data);
    })
  },
  update: (req, res) => {
    const { username, password } = req.body;

    const { email } = req.user_data;

    _data.read('users', email, (err, data) => {
      if (!data) {
        return res.status(400).json({ err: "user account doesnot exists" });
      }

      const { passwordHash, salt } = middleWare.hash(password);
      const userObject = {
        username: username.trim(),
        email: email.trim(),
        password: passwordHash,
        salt,
      }
      _data.create('users', email, userObject, (err) => {
        if (err) {
          return res.status(500).json({
            err: "unable to update user account, try again later"
          });
        }
        return res.status(201).json({
          user: { username, email }, msg: "Account successfully updated"
        });
      });
    });
  },
};
