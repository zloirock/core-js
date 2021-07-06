'use strict';
delete global.Promise;

require('core-js/commonjs');
const assert = require('assert');

module.exports = {
  deferred() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  },
  resolved(value) {
    return Promise.resolve(value);
  },
  rejected(reason) {
    return Promise.reject(reason);
  },
  defineGlobalPromise(global) {
    global.Promise = Promise;
    global.assert = assert;
  },
  removeGlobalPromise() {
    delete global.Promise;
  },
};
