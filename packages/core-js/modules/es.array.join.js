'use strict';
// 22.1.3.13 Array.prototype.join(separator)
var toIndexedObject = require('core-js-internals/to-indexed-object');
var arrayJoin = [].join;

// fallback for not array-like strings
require('./_export')({
  target: 'Array', proto: true,
  forced: require('core-js-internals/indexed-object') != Object || !require('./_strict-method')(arrayJoin)
}, {
  join: function join(separator) {
    return arrayJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});
