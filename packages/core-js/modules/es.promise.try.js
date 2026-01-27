'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var apply = require('../internals/function-apply');
var aCallable = require('../internals/a-callable');
var slice = require('../internals/array-slice');
var promiseResolve = require('../internals/promise-resolve');
var newPromiseCapabilityModule = require('../internals/new-promise-capability');
var perform = require('../internals/perform');
var fails = require('../internals/fails');

var Promise = globalThis.Promise;

var ACCEPT_ARGUMENTS = false;
var FORCED = !Promise || !Promise.try || fails(function () {
  var p = Promise.resolve();
  return Promise.try(function (argument) {
    // avoiding the use of polyfills of the previous iteration of this proposal
    // that does not accept arguments of the callback
    ACCEPT_ARGUMENTS = argument === 8;
    return p;
  // it should use `PromiseResolve`
  // https://github.com/tc39/ecma262/pull/3883
  }, 8) !== p;
}) || !ACCEPT_ARGUMENTS;

// `Promise.try` method
// https://tc39.es/ecma262/#sec-promise.try
$({ target: 'Promise', stat: true, forced: FORCED }, {
  try: function (callbackfn /* , ...args */) {
    var args = arguments.length > 1 ? slice(arguments, 1) : [];
    var result = perform(function () {
      return apply(aCallable(callbackfn), undefined, args);
    });
    // @dependency: es.promise.constructor
    // @dependency: es.promise.catch
    // @dependency: es.promise.finally
    if (!result.error) return promiseResolve(this, result.value);
    var promiseCapability = newPromiseCapabilityModule.f(this);
    var reject = promiseCapability.reject;
    reject(result.value);
    return promiseCapability.promise;
  },
});
