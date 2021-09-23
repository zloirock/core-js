var isObject = require('../internals/is-object');
var has = require('../internals/has');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
module.exports = function (O, options) {
  if (isObject(options) && has(options, 'cause')) {
    createNonEnumerableProperty(O, 'cause', O.cause);
  }
};
