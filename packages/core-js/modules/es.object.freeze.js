'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var isObject = require('../internals/is-object');

var $freeze = Object.freeze;
var FAILS_ON_PRIMITIVES = fails(function () { $freeze(1); });

// `Object.freeze` method
// https://tc39.es/ecma262/#sec-object.freeze
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  freeze: function freeze(it) {
    return isObject(it) ? $freeze(it) : it;
  },
});
