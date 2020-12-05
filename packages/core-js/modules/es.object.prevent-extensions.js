var $ = require('../internals/export');
var isObject = require('../internals/is-object');
var onFreeze = require('../internals/internal-metadata').onFreeze;
var fails = require('../internals/fails');

// eslint-disable-next-line es/no-object-preventextensions -- safe
var $preventExtensions = Object.preventExtensions;
var FAILS_ON_PRIMITIVES = fails(function () { $preventExtensions(1); });

// `Object.preventExtensions` method
// https://tc39.es/ecma262/#sec-object.preventextensions
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  preventExtensions: function preventExtensions(it) {
    return isObject(it) ? $preventExtensions(onFreeze(it)) : it;
  },
});
