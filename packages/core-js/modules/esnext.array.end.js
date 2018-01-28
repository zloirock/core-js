// https://github.com/keithamus/proposal-array-last
'use strict';
var DESCRIPTORS = require('core-js-internals/descriptors');
var toObject = require('core-js-internals/to-object');
var toLength = require('core-js-internals/to-length');
var defineProperty = require('./_object-dp').f;

if (DESCRIPTORS && !('end' in [])) {
  defineProperty(Array.prototype, 'end', {
    configurable: true,
    get: function end() {
      var O = toObject(this);
      var len = toLength(O.length);
      return len == 0 ? undefined : O[len - 1];
    },
    set: function end(value) {
      var O = toObject(this);
      var len = toLength(O.length);
      return O[len == 0 ? 0 : len - 1] = value;
    }
  });
}
