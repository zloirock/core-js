'use strict';
// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
var newPromiseCapabilityModule = require('../internals/new-promise-capability');
var perform = require('../internals/perform');

require('../internals/export')({ target: 'Promise', stat: true }, {
  'try': function (callbackfn) {
    var promiseCapability = newPromiseCapabilityModule.f(this);
    var result = perform(callbackfn);
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});
