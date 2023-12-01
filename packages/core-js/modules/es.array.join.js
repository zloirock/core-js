'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toObject = require('../internals/to-object');
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

var nativeJoin = uncurryThis([].join);

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$({ target: 'Array', proto: true, forced: !arrayMethodIsStrict('join', ',') }, {
  join: function join(separator) {
    return nativeJoin(toObject(this), separator === undefined ? ',' : separator);
  },
});
