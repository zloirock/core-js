'use strict';
var $ = require('../internals/export');
var arrayWith = require('../internals/array-with');
var toObject = require('../internals/to-object');

var $Array = Array;

// `Array.prototype.with` method
// https://tc39.es/ecma262/#sec-array.prototype.with
$({ target: 'Array', proto: true }, {
  with: function (index, value) {
    return arrayWith(toObject(this), $Array, index, value);
  },
});
