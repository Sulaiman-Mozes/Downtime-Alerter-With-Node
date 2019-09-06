module.exports = {

  stringValidator: value => typeof (value) === 'string' && value.trim().length > 0 ? true : false,

  numberValidator: value => typeof value === 'number' && value ? value : false,

  boolValidator: value => typeof value === 'boolean' && value === true ? true : false,

  emailValidator: email => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  passwordValidator: password => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,16})/;
    return re.test(String(password));
  },

};

// 	The string must contain at least 1 lowercase alphabetical character
// 	The string must contain at least 1 uppercase alphabetical character
//  The string must contain at least 1 numeric character
//  The string must contain at least one special character => ?=.[!@#\$%\^&]
//  The string must be eight characters or longer
