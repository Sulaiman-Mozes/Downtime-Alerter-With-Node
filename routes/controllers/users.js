const _data = require('../../middleware/data');
const middleWare = require('../../middleware/common');
const { stringValidator, boolValidator,
  emailValidator } = require('../../middleware/validator');


const fileExits = async (dir, email) => {
  try {
    const data = await _data.read('users', email);
    return data;
  } catch (error) {
    return false;
  }
}

module.exports = {
  create: async (req, res) => {
    const { username, password, email, tosAgreement } = req.body;

    if (!stringValidator(username) || !stringValidator(password) || !stringValidator(email)
      || !boolValidator(tosAgreement)) {
      return res.status(400).json({ err: 'All Feilds are Required' });
    }

    try {
      if ((await fileExits('users', email))) {
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

      await _data.create('users', email, userObject);

      return res.status(201).json({
        user: { username, email }, msg: "Account successfully created"
      });
    } catch (error) {

      return res.status(500).json({
        err: "unable to create user account, try again later",
        error
      });
    }

  },
  login: async (req, res) => {
    const { password, email } = req.body;

    if (!stringValidator(email) || !stringValidator(password)) {
      return res.status(400).json({ err: 'All Feilds are Required' });
    }

    try {
      let data = await fileExits('users', email);
      if (!data) {
        return res.status(400).json({ err: "Authentication Failed, inavlid email or password" });
      }

      data = JSON.parse(data);

      const token = middleWare.createToken({ email: data.email, username: data.username }, 60 * 60 * 24);

      const userObject = {
        email: data.email,
        username: data.email,
        token
      }

      return middleWare.verify(data.salt, data.password, password) !== true
        ? res.status(400).json({ err: "Authentication Failed, invalid email or password" })
        : res.status(200).json(userObject);

    } catch (error) {
      return res.status(500).json({ msg: "An Error Occurred try again later" });
    }

  },

  delete: async (req, res) => {
    const { email } = req.user_data;
    try {
      let data = await fileExits('users', email);
      if (!data) {
        return res.status(400).json({ err: "User Doesnot Exist" });
      };
      await _data.delete('users', email);
      return res.status(204).json({ msg: "user account delete successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "unable delete user account" });
    }
  },

  get: async (req, res) => {
    try {
      const { email } = req.user_data;
      const data = await _data.read('users', email);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ msg: "user doesnot exist", error });
    }
  },

  list: async (req, res) => {
    try {
      const data = await _data.list('users');
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ err: "unable to get all users" });
    }
  },

  update: async (req, res) => {
    try {

      const { username, password } = req.body;

      const { email } = req.user_data;

      let data = await fileExits('users', email);

      data = JSON.parse(data);

      if (!data) {
        return res.status(400).json({ err: "user account doesnot exists" });
      }

      const userObject = {
        username: username.trim(),
      }

      if (!stringValidator(password)) {
        const { passwordHash, salt } = middleWare.hash(password);
        userObject.password = passwordHash;
        userObject.salt = salt;
      }

      await _data.update('users', email, { ...data, ...userObject });
      const resp = JSON.parse(await fileExits('users', email));

      return res.status(201).json({
        user: { username: resp.username, email: resp.email }, msg: "Account successfully updated"
      });

    } catch (error) {
      return res.status(500).json({
        err: "unable to update user account, try again later"
      });
    }
  },
};
