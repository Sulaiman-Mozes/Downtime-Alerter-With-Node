const _data = require('../../middleware/data');
const { stringValidator, numberValidator } = require('../../middleware/validator');
const { randomString } = require('../../middleware/common');

const fileExits = async (dir, email) => {
  try {
    const data = await _data.read(dir, email);
    return data;
  } catch (error) {
    return false;
  }
}

module.exports = {
  create: async (req, res) => {

    const { url, successCode, timeoutSeconds, protocol, method } = req.body;

    const { email } = req.user_data;

    if (!stringValidator(url) || !numberValidator(successCode)
      || !numberValidator(timeoutSeconds) || !stringValidator(method)
      || !stringValidator(protocol)) {
      return res.status(400).json({ err: 'All Feilds are Required' });
    }

    try {
      let data = await fileExits('users', email);

      if (!data) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }

      data = JSON.parse(data);
      if (data.checks.length >= 5) {
        return res.status(400).json({ err: "User already has the maximum umber of checks(5)" });
      }

      const checkId = randomString();

      const checkObject = {
        email,
        url,
        method,
        protocol,
        successCode,
        timeoutSeconds,
        checkId,
        status: 'pending'
      }

      const checKres = await _data.create('checks', checkId, checkObject);

      data.checks.push(checkId);
      await _data.update('users', email, data);

      return res.status(201).json({
        check: checKres, msg: "Check has successfully been created"
      });

    } catch (error) {
      return res.status(500).json({
        err: "unable to create new check, try again later"
      });
    }
  },

  get: async (req, res) => {
    const { email } = req.user_data;
    const { id } = req.query;
    if (!stringValidator(id)) {
      return res.status(404).json({ err: "check id is required" });
    }

    try {
      let data = await _data.read('users', email);
      if (!data) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }
      data = JSON.parse(data);
      if (data.checks.indexOf(id) === -1) {
        return res.status(403).json({ err: "You are not authorized to view this check" });
      }

      const checkdata = await _data.read('checks', id);
      return res.status(200).json(checkdata);

    } catch (error) {
      return res.status(404).json({ err: "check doesnot exists" })
    }
  },

  list: async (req, res) => {
    const { email } = req.user_data;
    try {
      let data = await _data.read('users', email);
      data = JSON.parse(data);
      return res.status(200).json({ checks: data.checks });
    } catch (error) {
      return res.status(404).json({ err: "user account doesnot exists" });
    }
  },

  delete: async (req, res) => {
    const { email } = req.user_data;
    const { id } = req.query;
    if (!stringValidator(id)) {
      return res.status(404).json({ err: "check id is required" });
    }

    try {
      let data = await fileExits('users', email);
      if (!data) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }

      data = JSON.parse(data);
      const checkdata = await fileExits('checks', id);

      if (!checkdata) {
        return res.status(404).json({ err: "check doesnot exists" })
      }

      if (data.checks.indexOf(id) === -1) {
        return res.status(403).json({ err: "You are not authorized to delete this check" });
      }

      await _data.delete('checks', id);

      const newCheckError = data.checks.filter(check => check !== id);
      await _data.update('users', email, { ...data, checks: newCheckError });

      return res.status(204).json({ msg: "check delete successfully" });

    } catch (error) {
      return res.status(500).json({ msg: "unable delete check" });
    }
  },

  update: async (req, res) => {
    const { url, successCode, timeoutSeconds, protocol, method } = req.body;

    const { email } = req.user_data;

    const { id } = req.query;
    if (!stringValidator(id)) {
      return res.status(404).json({ err: "check id is required" });
    }

    if (!stringValidator(url) || !numberValidator(successCode)
      || !numberValidator(timeoutSeconds) || !stringValidator(method)
      || !stringValidator(protocol)) {
      return res.status(400).json({ err: 'All Feilds are Required' });
    }

    try {

      let data = await _data.read('users', email);
      if (!data) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }

      data = JSON.parse(data);
      let checkdata = await _data.read('checks', id);

      if (!checkdata) {
        return res.status(404).json({ err: "check doesnot exists" })
      }

      if (data.checks.indexOf(id) === -1) {
        return res.status(403).json({ err: "You are not authorized to delete this check" });
      }

      checkdata = JSON.parse(checkdata);

      const checkObject = {
        email,
        url,
        method,
        protocol,
        successCode,
        timeoutSeconds,
      }

      await _data.update('checks', id, { ...checkdata, ...checkObject });
      const Checkdata = await fileExits('checks', id)

      return res.status(201).json({
        check: JSON.parse(Checkdata), msg: "Check has successfully been updated"
      });

    } catch (error) {
      return res.status(500).json({
        err: "unable to update check, try again later"
      });
    }
  },
}