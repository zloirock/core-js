'use strict';
var fails = require('../internals/fails');
var anObject = require('../internals/an-object');
var normalizeStringArgument = require('../internals/normalize-string-argument');

var nativeErrorToString = Error.prototype.toString;

var INCORRECT_TO_STRING = fails(function () {
  // Chrome 32- incorrectly call accessor
  var object = Object.create(Object.defineProperty({}, 'name', { get: function () {
    return this === object;
  } }));
  return nativeErrorToString.call(object) !== 'true'
    // FF10- does not properly handle non-strings
    || nativeErrorToString.call({ message: 1, name: 2 }) !== '2: 1'
    // IE8 does not properly handle defaults
    || nativeErrorToString.call({}) !== 'Error';
});

module.exports = INCORRECT_TO_STRING ? function toString() {
  var O = anObject(this);
  var name = normalizeStringArgument(O.name, 'Error');
  var message = normalizeStringArgument(O.message);
  return !name ? message : !message ? name : name + ': ' + message;
} : nativeErrorToString;
