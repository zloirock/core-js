'use strict';
delete globalThis.Promise;

const pkg = process.argv.includes('--pure') ? '@core-js/pure' : 'core-js';

// eslint-disable-next-line import/no-dynamic-require -- dynamic
const Promise = require(`${ pkg }/es/promise`);
const assert = require('node:assert');

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
  defineGlobalPromise() {
    globalThis.Promise = Promise;
    globalThis.assert = assert;
  },
  removeGlobalPromise() {
    delete globalThis.Promise;
  },
};
