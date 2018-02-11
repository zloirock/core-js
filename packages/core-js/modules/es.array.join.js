'use strict';
var toIndexedObject = require('core-js-internals/to-indexed-object');
var nativeJoin = [].join;
var ES3_STRINGS = require('core-js-internals/indexed-object') != Object;
var SLOPPY_METHOD = !require('../internals/strict-method')(nativeJoin);

// `Array.prototype.join` method
// https://tc39.github.io/ecma262/#sec-array.prototype.join
require('../internals/export')({ target: 'Array', proto: true, forced: ES3_STRINGS || SLOPPY_METHOD }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});
