'use strict';
// https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatten
var flattenIntoArray = require('core-js-internals/flatten-into-array');
var toObject = require('core-js-internals/to-object');
var toLength = require('core-js-internals/to-length');
var toInteger = require('core-js-internals/to-integer');
var arraySpeciesCreate = require('core-js-internals/array-species-create');

require('../internals/export')({ target: 'Array', proto: true }, {
  flatten: function flatten(/* depthArg = 1 */) {
    var depthArg = arguments[0];
    var O = toObject(this);
    var sourceLen = toLength(O.length);
    var A = arraySpeciesCreate(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger(depthArg));
    return A;
  }
});

require('../internals/add-to-unscopables')('flatten');
