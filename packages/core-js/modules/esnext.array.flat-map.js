'use strict';
// https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatMap
var flattenIntoArray = require('core-js-internals/flatten-into-array');
var toObject = require('core-js-internals/to-object');
var toLength = require('core-js-internals/to-length');
var aFunction = require('core-js-internals/a-function');
var arraySpeciesCreate = require('core-js-internals/array-species-create');

require('./_export')({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject(this);
    var sourceLen = toLength(O.length);
    var A;
    aFunction(callbackfn);
    A = arraySpeciesCreate(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);
    return A;
  }
});

require('./_add-to-unscopables')('flatMap');
