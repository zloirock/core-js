'use strict';
var call = require('../internals/function-call');
var isCallable = require('../internals/is-callable');
var tryToString = require('../internals/try-to-string');
var getIteratorMethod = require('../internals/get-iterator-method');

var $TypeError = TypeError;

module.exports = function (argument) {
  var iteratorMethod = getIteratorMethod(argument);
  if (isCallable(iteratorMethod)) return call(iteratorMethod, argument);
  throw new $TypeError(tryToString(argument) + ' is not iterable');
};
