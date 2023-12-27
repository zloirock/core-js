'use strict';
/* eslint-disable no-new, sonarjs/inconsistent-function-call -- required for testing */
var fails = require('../internals/fails');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');

var $Int8Array = Int8Array;

module.exports = !fails(function () {
  $Int8Array(1);
}) || !fails(function () {
  new $Int8Array(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new $Int8Array();
  new $Int8Array(null);
  new $Int8Array(1.5);
  new $Int8Array(iterable);
}, true) || fails(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new $Int8Array(new ArrayBuffer(2), 1, undefined).length !== 1;
});
