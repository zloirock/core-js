'use strict';
var $ = require('../internals/export');
var arrayWithReversed = require('../internals/array-with-reversed');
var toIndexedObject = require('../internals/to-indexed-object');
var addToUnscopables = require('../internals/add-to-unscopables');

// `Array.prototype.withReversed` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withReversed
$({ target: 'Array', proto: true }, {
  withReversed: function withReversed() {
    return arrayWithReversed(toIndexedObject(this), Array);
  }
});

addToUnscopables('withReversed');
