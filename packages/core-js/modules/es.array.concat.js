'use strict';
var isArray = require('../internals/is-array');
var isObject = require('../internals/is-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var createProperty = require('../internals/create-property');
var arraySpeciesCreate = require('../internals/array-species-create');
var IS_CONCAT_SPREADABLE = require('../internals/well-known-symbol')('isConcatSpreadable');

var IS_CONCAT_SPREADABLE_SUPPORT = !require('../internals/fails')(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = require('../internals/check-array-species-create')(function (array) {
  return array.concat();
});

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

// `Array.prototype.concat` method
// https://tc39.github.io/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
require('../internals/export')({
  target: 'Array', proto: true, forced: !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT
}, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength(E.length);
        if (n + len > 9007199254740991) throw TypeError('Incorrect length!');
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else createProperty(A, n++, E);
    }
    A.length = n;
    return A;
  }
});
