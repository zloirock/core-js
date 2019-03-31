var objectSetPrototypeOf = require('../internals/object-set-prototype-of');
var validateSetPrototypeOfArguments = require('../internals/validate-set-prototype-of-arguments');

// `Reflect.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-reflect.setprototypeof
if (objectSetPrototypeOf) require('../internals/export')({ target: 'Reflect', stat: true }, {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    validateSetPrototypeOfArguments(target, proto);
    try {
      objectSetPrototypeOf(target, proto);
      return true;
    } catch (error) {
      return false;
    }
  }
});
