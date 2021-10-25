'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var arrayWithReversed = require('../internals/array-with-reversed');
var toIndexedObject = require('../internals/to-indexed-object');
var addToUnscopables = require('../internals/add-to-unscopables');

var Array = global.Array;

// `Array.prototype.withReversed` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withReversed
$({ target: 'Array', proto: true }, {
  withReversed: function withReversed() {
    return arrayWithReversed(toIndexedObject(this), Array);
  }
});

addToUnscopables('withReversed');
