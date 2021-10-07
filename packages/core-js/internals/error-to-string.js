'use strict';
var fails = require('../internals/fails');
var anObject = require('../internals/an-object');
var normalizeStringArgument = require('../internals/normalize-string-argument');

var nativeErrorToString = Error.prototype.toString;

// FF10-
var INCORRECT_TO_STRING = fails(function () {
  return String(nativeErrorToString.call({ message: 1, name: 2 })) !== '2: 1';
});

module.exports = INCORRECT_TO_STRING ? function toString() {
  var O = anObject(this);
  var name = normalizeStringArgument(O.name, 'Error');
  var message = normalizeStringArgument(O.message);
  return !name ? message : !message ? name : name + ': ' + message;
} : nativeErrorToString;
