'use strict';
var $ = require('../internals/export');
var FORCED_PROMISE_CONSTRUCTOR = require('../internals/promise-forced-constructor');

// `Promise.reject` method
// https://tc39.github.io/ecma262/#sec-promise.reject
$({ target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR, real: FORCED_PROMISE_CONSTRUCTOR }, {
  catch: function (onRejected) {
    return this.then(undefined, onRejected);
  },
});
