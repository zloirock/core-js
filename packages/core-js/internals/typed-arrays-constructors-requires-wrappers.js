var global = require('../internals/global');
var fails = require('../internals/fails');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');
var NATIVE_ARRAY_BUFFER_VIEWS = require('../internals/array-buffer-view-core').NATIVE_ARRAY_BUFFER_VIEWS;
var ArrayBuffer = global.ArrayBuffer;
var Int8Array = global.Int8Array;

module.exports = !NATIVE_ARRAY_BUFFER_VIEWS || !fails(function () {
  Int8Array(1);
}) || !fails(function () {
  new Int8Array(-1); // eslint-disable-line no-new
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array(); // eslint-disable-line no-new
  new Int8Array(null); // eslint-disable-line no-new
  new Int8Array(1.5); // eslint-disable-line no-new
  new Int8Array(iterable); // eslint-disable-line no-new
}, true) || fails(function () {
  // Safari 11 bug
  return new Int8Array(new ArrayBuffer(2), 1, undefined).length !== 1;
});
