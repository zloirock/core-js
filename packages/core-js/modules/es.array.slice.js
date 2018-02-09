'use strict';
var html = require('core-js-internals/html');
var classof = require('core-js-internals/classof-raw');
var toAbsoluteIndex = require('core-js-internals/to-absolute-index');
var toLength = require('core-js-internals/to-length');
var nativeSlice = [].slice;

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
require('./_export')({ target: 'Array', proto: true, forced: require('core-js-internals/fails')(function () {
  if (html) nativeSlice.call(html);
}) }, {
  slice: function slice(begin, end) {
    var length = toLength(this.length);
    var klass = classof(this);
    end = end === undefined ? length : end;
    if (klass == 'Array') return nativeSlice.call(this, begin, end);
    var start = toAbsoluteIndex(begin, length);
    var upTo = toAbsoluteIndex(end, length);
    var size = toLength(upTo - start);
    var cloned = new Array(size);
    var i = 0;
    for (; i < size; i++) cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});
