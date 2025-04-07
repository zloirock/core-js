'use strict';
var $ = require('../internals/export');
var map = require('../internals/iterator-map');
var IS_PURE = require('../internals/is-pure');
var globalThis = require('../internals/global-this');

var Iterator = globalThis.Iterator;
var nativeMap = Iterator && Iterator.prototype && Iterator.prototype.map;
var FORCED = IS_PURE || nativeMap !== map;

// `Iterator.prototype.map` method
// https://tc39.es/ecma262/#sec-iterator.prototype.map
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  map: map
});
