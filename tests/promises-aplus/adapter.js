delete global.Promise;

var Promise = require('../../packages/core-js').Promise;
var assert = require('assert');

module.exports = {
  deferred: function () {
    var deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  },
  resolved: function (value) {
    return Promise.resolve(value);
  },
  rejected: function (reason) {
    return Promise.reject(reason);
  },
  defineGlobalPromise: function (global) {
    global.Promise = Promise;
    global.assert = assert;
  },
  removeGlobalPromise: function () {
    delete global.Promise;
  }
};
