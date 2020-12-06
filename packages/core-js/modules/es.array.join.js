'use strict';
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

var nativeJoin = [].join;

var STRICT_METHOD = arrayMethodIsStrict('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$({ target: 'Array', proto: true, forced: !STRICT_METHOD }, {
  join: function join(separator) {
    return nativeJoin.call(toObject(this), separator === undefined ? ',' : separator);
  },
});
