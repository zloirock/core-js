'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var arrayWithAt = require('../internals/array-with-at');
var toIndexedObject = require('../internals/to-indexed-object');
var addToUnscopables = require('../internals/add-to-unscopables');

var Array = global.Array;

// `Array.prototype.withAt` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withAt
$({ target: 'Array', proto: true }, {
  withAt: function withAt(index, value) {
    return arrayWithAt(toIndexedObject(this), Array, index, value);
  }
});

addToUnscopables('withAt');
