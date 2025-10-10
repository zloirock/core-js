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
var uncurryThis = require('../internals/function-uncurry-this');

var create = Object.create;
var forEach = uncurryThis([].forEach);
// dependency: es.reflect.own-keys
var ownKeys = getBuiltInStaticMethod('Reflect', 'ownKeys');

// `Promise.allKeyed` method
// https://tc39.es/proposal-await-dictionary
$({ target: 'Promise', stat: true, forced: true }, {
  allKeyed: function allKeyed(promises) {
    var C = this;
    // dependency: es.promise.constructor
    // dependency: es.promise.catch
    // dependency: es.promise.finally
    // dependency: es.promise.resolve
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
      forEach(allKeys, function (key) {
        var desc = getOwnPropertyDescriptor.f(promises, key);
        if (desc && desc.enumerable) {
          var index = counter;
          var alreadyCalled = false;
          remaining++;
          keys[index] = key;
          values[index] = undefined;
          call(promiseResolve, C, promises[key]).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[index] = value;
            --remaining;
            if (remaining === 0) {
              var res = create(null);
              forEach(keys, function (k, idx) {
                createProperty(res, k, values[idx]);
              });
              resolve(res);
            }
          }, reject);
          counter++;
        }
      });
      --remaining || resolve(create(null));
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
});
