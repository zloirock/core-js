'use strict';
var $ = require('../internals/export');
var isObject = require('../internals/is-object');
var fails = require('../internals/fails');

var $seal = Object.seal;
var FAILS_ON_PRIMITIVES = fails(function () { $seal(1); });

// `Object.seal` method
// https://tc39.es/ecma262/#sec-object.seal
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  seal: function seal(it) {
    return isObject(it) ? $seal(it) : it;
  },
});
