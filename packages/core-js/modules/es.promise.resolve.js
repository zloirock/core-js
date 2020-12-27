'use strict';
var $ = require('../internals/export');
var Promise = require('../internals/native-promise-constructor');
var getBuiltIn = require('../internals/get-built-in');
var promiseResolve = require('../internals/promise-resolve');
var IS_PURE = require('../internals/is-pure');
var FORCED_PROMISE_CONSTRUCTOR = require('../internals/promise-forced-constructor');

var PromiseWrapper = getBuiltIn('Promise');
var CHECK_WRAPPER = IS_PURE && !FORCED_PROMISE_CONSTRUCTOR;

$({ target: 'Promise', stat: true, forced: IS_PURE || FORCED_PROMISE_CONSTRUCTOR }, {
  // `Promise.resolve` method
  // https://tc39.github.io/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve(CHECK_WRAPPER && this === PromiseWrapper ? Promise : this, x);
  },
});
