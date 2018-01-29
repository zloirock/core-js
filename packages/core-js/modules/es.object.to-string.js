'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('core-js-internals/classof');
var test = {};
test[require('core-js-internals/well-known-symbol')('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  require('./_redefine')(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}
