'use strict';
var html = require('core-js-internals/html');
var cof = require('core-js-internals/classof-raw');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('core-js-internals/to-length');
var arraySlice = [].slice;

// fallback for not array-like ES3 strings and DOM objects
require('./_export')({ target: 'Array', proto: true, forced: require('./_fails')(function () {
  if (html) arraySlice.call(html);
}) }, {
  slice: function slice(begin, end) {
    var len = toLength(this.length);
    var klass = cof(this);
    end = end === undefined ? len : end;
    if (klass == 'Array') return arraySlice.call(this, begin, end);
    var start = toAbsoluteIndex(begin, len);
    var upTo = toAbsoluteIndex(end, len);
    var size = toLength(upTo - start);
    var cloned = new Array(size);
    var i = 0;
    for (; i < size; i++) cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});
