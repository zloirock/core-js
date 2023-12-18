'use strict';
var $ = require('../internals/export');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var call = require('../internals/function-call');
var createProperty = require('../internals/create-property');
var getBuiltInStaticMethod = require('../internals/get-built-in-static-method');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor');
var newPromiseCapabilityModule = require('../internals/new-promise-capability');
var perform = require('../internals/perform');

var create = Object.create;
var ownKeys = getBuiltInStaticMethod('Reflect', 'ownKeys');

// `Promise.allSettledKeyed` method
// https://github.com/tc39/proposal-await-dictionary
$({ target: 'Promise', stat: true }, {
  allSettledKeyed: function allSettledKeyed(promises) {
    var C = this;
    var capability = newPromiseCapabilityModule.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var promiseResolve = aCallable(C.resolve);
      var allKeys = ownKeys(anObject(promises));
      var keys = [];
      var values = [];
      var remaining = 1;
      var counter = 0;
      for (var i = 0; i < allKeys.length; i++) (function (key) {
        var desc = getOwnPropertyDescriptor.f(promises, key);
        if (desc && desc.enumerable) {
          var createElementResolver = function (rejection) {
            return function (value) {
              if (alreadyCalled) return;
              alreadyCalled = true;
              values[index] = rejection
                ? { status: 'rejected', reason: value }
                : { status: 'fulfilled', value: value };
              if (--remaining) return;
              var res = create(null);
              for (var j = 0; j < keys.length; j++) createProperty(res, keys[j], values[j]);
              resolve(res);
            };
          };
          var index = counter;
          var alreadyCalled = false;
          remaining++;
          keys[index] = key;
          values[index] = undefined;
          call(promiseResolve, C, promises[key]).then(createElementResolver(false), createElementResolver(true));
          counter++;
        }
      })(allKeys[i]);
      --remaining || resolve(create(null));
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
});
