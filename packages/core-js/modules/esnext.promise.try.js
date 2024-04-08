'use strict';
var $ = require('../internals/export');
var apply = require('../internals/function-apply');
var slice = require('../internals/array-slice');
var newPromiseCapabilityModule = require('../internals/new-promise-capability');
var aCallable = require('../internals/a-callable');
var perform = require('../internals/perform');

// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
$({ target: 'Promise', stat: true, forced: true }, {
  'try': function (callbackfn /* , ...args */) {
    var args = slice(arguments, 1);
    var promiseCapability = newPromiseCapabilityModule.f(this);
    var result = perform(function () {
      return apply(aCallable(callbackfn), undefined, args);
    });
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});
