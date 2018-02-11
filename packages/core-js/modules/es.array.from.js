'use strict';
var bind = require('core-js-internals/bind-context');
var toObject = require('core-js-internals/to-object');
var call = require('../internals/call-with-safe-iteration-closing');
var isArrayIter = require('../internals/is-array-iter');
var toLength = require('core-js-internals/to-length');
var createProperty = require('../internals/create-property');
var getIterFn = require('./core.get-iterator-method');
var FORCED = !require('../internals/iter-detect')(function (iter) { Array.from(iter); });

// `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from
require('../internals/export')({ target: 'Array', stat: true, forced: FORCED }, {
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = bind(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});
