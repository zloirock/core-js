'use strict';
// 22.1.3.13 Array.prototype.join(separator)
var toIObject = require('./_to-iobject');
var arrayJoin = [].join;

// fallback for not array-like strings
require('./_export')({
  target: 'Array', proto: true,
  forced: require('./_iobject') != Object || !require('./_strict-method')(arrayJoin)
}, {
  join: function join(separator) {
    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
  }
});
