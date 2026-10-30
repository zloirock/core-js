'use strict';
var globalThis = require('../internals/global-this');
var fails = require('../internals/fails');
var V8 = require('../internals/environment-v8-version');
var ENVIRONMENT = require('../internals/environment');

var structuredClone = globalThis.structuredClone;

module.exports = !!structuredClone && !fails(function () {
  // prevent V8 ArrayBufferDetaching protector cell invalidation and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  // Deno 1.13 (V8 9.3) supports MessagePort transfer, but not ArrayBuffer transfer.
  if ((ENVIRONMENT === 'DENO' && V8 > 93) || (ENVIRONMENT === 'NODE' && V8 > 94) || V8 > 97) return false;
  var buffer = new ArrayBuffer(8);
  var clone = structuredClone(buffer, { transfer: [buffer] });
  return buffer.byteLength !== 0 || clone.byteLength !== 8;
});
