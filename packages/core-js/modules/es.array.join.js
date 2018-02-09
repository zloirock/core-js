'use strict';
var toIndexedObject = require('core-js-internals/to-indexed-object');
var nativeJoin = [].join;
var FORCED = require('core-js-internals/indexed-object') != Object || !require('./_strict-method')(nativeJoin);

// `Array.prototype.join` method
// https://tc39.github.io/ecma262/#sec-array.prototype.join
// fallback for not array-like strings
require('./_export')({ target: 'Array', proto: true, forced: FORCED }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});
