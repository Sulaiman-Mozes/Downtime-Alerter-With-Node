const _data = require('../../middleware/data');
const { stringValidator, numberValidator } = require('../../middleware/validator');

module.exports = {
  create: (req, res) => {

    const { url, successCode, timeoutSeconds, protocol, method } = req.body;

    const { email } = req.user_data;

    if (!stringValidator(url) || !numberValidator(successCode)
      || !numberValidator(timeoutSeconds) || !stringValidator(method)
      || !stringValidator(protocol)) {
      return res.status(400).json({ err: 'All Feilds are Required' });
    }

    _data.read('users', email, (err, data) => {
      if (err) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }
      data = JSON.parse(data);
      if (data.checks.length >= 5) {
        return res.status(400).json({ err: "User already has the maximum umber of checks(5)" });
      }

      const checkId = `${email}-${new Date().toJSON().replace(/:/g, '-')}`;

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

      _data.create('checks', checkId, checkObject, (error) => {
        if (error) {
          return res.status(500).json({
            err: "unable to create new check, try again later"
          });
        }
        data.checks.push(checkId);
        _data.update('users', email, data, (error) => {
          return error ? res.status(500).json({
            err: "unable to add new check to the user account, try again later"
          })
            : res.status(201).json({
              check: checkObject, msg: "Check has successfully been created"
            });
        });
      });
    });
  },
  get: (req, res) => {
    const { email } = req.user_data;
    const { id } = req.query;
    if (!stringValidator(id)) {
      return res.status(404).json({ err: "check id is required" });
    }
    _data.read('users', email, (err, data) => {
      if (err) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }
      data = JSON.parse(data);
      if (data.checks.indexOf(id) === -1) {
        return res.status(403).json({ err: "You are not authorized to view this check" });
      }
      _data.read('checks', id, (err, checkdata) => {
        return err
          ? res.status(404).json({ err: "check doesnot exists" })
          : res.status(200).json(checkdata);
      });

    });
  },
  list: (req, res) => {
    const { email } = req.user_data;
    _data.read('users', email, (err, data) => {
      if (err) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }
      data = JSON.parse(data);
      return res.status(200).json({ checks: data.checks });
    });
  },
  delete: (req, res) => {
    const { email } = req.user_data;
    const { id } = req.query;
    if (!stringValidator(id)) {
      return res.status(404).json({ err: "check id is required" });
    }
    _data.read('users', email, (err, data) => {
      if (err) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }
      data = JSON.parse(data);
      _data.read('checks', id, (err) => {
        if (err) {
          return res.status(404).json({ err: "check doesnot exists" })
        }

        if (data.checks.indexOf(id) === -1) {
          return res.status(403).json({ err: "You are not authorized to delete this check" });
        }

        _data.delete('checks', id, (error) => {
          if (error) {
            return res.status(500).json({ msg: "unable delete check" });
          }
          const newCheckError = data.checks.filter(check => check !== id);
          _data.update('users', email, { ...data, checks: newCheckError }, (error) => {
            return error ? res.status(500).json({
              err: "unable to add new check to the user account, try again later"
            })
              : res.status(204).json({ msg: "check delete successfully" });
          });
        });
      });
    });
  },
  update: (req, res) => {
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

    _data.read('users', email, (err, data) => {
      if (err) {
        return res.status(404).json({ err: "user account doesnot exists" });
      }
      data = JSON.parse(data);

      _data.read('checks', id, (err) => {
        if (err) {
          return res.status(404).json({ err: "check doesnot exists" })
        }

        if (data.checks.indexOf(id) === -1) {
          return res.status(403).json({ err: "You are not authorized to delete this check" });
        }

        const checkObject = {
          email,
          url,
          method,
          protocol,
          successCode,
          timeoutSeconds,
        }

        _data.update('checks', id, checkObject, (error) => {
          if (error) {
            return res.status(500).json({
              err: "unable to update check, try again later"
            });
          }
          data.checks.push(checkId);
          _data.update('users', email, data, (error) => {
            return error ? res.status(500).json({
              err: "unable to add new check to the user account, try again later"
            })
              : res.status(201).json({
                check: checkObject, msg: "Check has successfully been updated"
              });
          });
        });
      });
    });
  },
}