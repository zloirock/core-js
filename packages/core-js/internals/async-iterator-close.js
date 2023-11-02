'use strict';
var call = require('../internals/function-call');
var getBuiltIn = require('../internals/get-built-in');
var getMethod = require('../internals/get-method');

// dependency: es.promise.constructor
// dependency: es.promise.catch
// dependency: es.promise.finally
// dependency: es.promise.resolve
var Promise = getBuiltIn('Promise');

module.exports = function (iterator, method, argument, reject) {
  try {
    var returnMethod = getMethod(iterator, 'return');
    if (returnMethod) {
      return Promise.resolve(call(returnMethod, iterator)).then(function () {
        method(argument);
      }, function (error) {
        reject(error);
      });
    }
  } catch (error2) {
    return reject(error2);
  } method(argument);
};
