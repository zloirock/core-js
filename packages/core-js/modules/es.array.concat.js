'use strict';
var $ = require('../internals/export');
var apply = require('../internals/function-apply');
var hasIndex = require('../internals/array-has-index');
var fails = require('../internals/fails');
var hasOwn = require('../internals/has-own-property');
var isArray = require('../internals/is-array');
var isObject = require('../internals/is-object');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var doesNotExceedSafeInteger = require('../internals/does-not-exceed-safe-integer');
var createProperty = require('../internals/create-property');
var setArrayLength = require('../internals/array-set-length');
var arraySpeciesCreate = require('../internals/array-species-create');
var arrayMethodHasSpeciesSupport = require('../internals/array-method-has-species-support');
var arrayMethodSetsPositiveLength = require('../internals/array-method-sets-positive-length');
var wellKnownSymbol = require('../internals/well-known-symbol');
var V8_VERSION = require('../internals/environment-v8-version');

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var ArrayPrototype = Array.prototype;
var nativeConcat = ArrayPrototype.concat;

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

// V8 5.1 - 6.1 skip writing the `length` of a result made by a species other than `Array`, so an array subclass loses
// trailing holes
// https://github.com/v8/v8/commit/fafc3d5e6a4f950cb9bc5005cd76be3050255fa6
var SKIPS_SPECIES_LENGTH = !FORCED && !arrayMethodSetsPositiveLength(nativeConcat, []);

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$({ target: 'Array', proto: true, arity: 1, forced: FORCED || SKIPS_SPECIES_LENGTH }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    // only an array with another prototype or an own `constructor` gets another species, unless `Array.prototype` or
    // `Array` is changed; the check calls no `constructor` getter, a proxy sees its traps
    if (SKIPS_SPECIES_LENGTH && !(isArray(this) && (getPrototypeOf(this) !== ArrayPrototype || hasOwn(this, 'constructor')))) {
      return apply(nativeConcat, this, arguments);
    }
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike(E);
        doesNotExceedSafeInteger(n + len);
        for (k = 0; k < len; k++, n++) if (hasIndex(E, k)) createProperty(A, n, E[k]);
      } else {
        doesNotExceedSafeInteger(n + 1);
        createProperty(A, n++, E);
      }
    }
    setArrayLength(A, n);
    return A;
  }
});
