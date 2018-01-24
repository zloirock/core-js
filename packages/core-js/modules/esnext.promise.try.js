'use strict';
// https://github.com/tc39/proposal-promise-try
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

require('./_export')({ target: 'Promise', stat: true }, { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });
