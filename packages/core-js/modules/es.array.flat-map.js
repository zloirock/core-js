'use strict';
var $ = require('../internals/export');
var flattenIntoArray = require('../internals/flatten-into-array');
var aCallable = require('../internals/a-callable');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var arraySpeciesCreate = require('../internals/array-species-create');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var fails = require('../internals/fails');

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('flatMap');

// Rhino bug - holes of arrays returned by the callback are kept
// https://github.com/mozilla/rhino/issues/2588
var BROKEN_ON_SPARSE_RESULT = fails(function () {
  // eslint-disable-next-line no-sparse-arrays, es/no-array-prototype-flat -- detection
  return [1].flatMap(function () { return [, 1]; }).length !== 1;
});

// `Array.prototype.flatMap` method
// https://tc39.es/ecma262/#sec-array.prototype.flatmap
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || BROKEN_ON_SPARSE_RESULT }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject(this);
    var sourceLen = lengthOfArrayLike(O);
    var A;
    aCallable(callbackfn);
    A = arraySpeciesCreate(O, 0);
    flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  }
});
