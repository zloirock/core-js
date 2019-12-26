'use strict';
var $ = require('../internals/export');
var $reduce = require('../internals/array-reduce').left;
var sloppyArrayMethod = require('../internals/sloppy-array-method');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var SLOPPY_METHOD = sloppyArrayMethod('reduce');
var USES_TO_LENGTH = arrayMethodUsesToLength('reduce');

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
$({ target: 'Array', proto: true, forced: SLOPPY_METHOD || !USES_TO_LENGTH }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});
