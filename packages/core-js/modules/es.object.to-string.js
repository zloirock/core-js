'use strict';
var classof = require('../internals/classof');
var TO_STRING_TAG = require('../internals/well-known-symbol')('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

// `Object.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
if (String(test) !== '[object z]') {
  require('../internals/redefine')(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}
