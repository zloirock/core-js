'use strict';
var anObject = require('../internals/an-object');
var fails = require('../internals/fails');
var flags = require('../internals/regexp-flags');
var TO_STRING = 'toString';
var nativeToString = /./[TO_STRING];
var RegExpPrototype = RegExp.prototype;

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  require('../internals/redefine')(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject(this);
    var rf = R.flags;
    return '/'.concat(R.source, '/',
      rf == null && R instanceof RegExp && !('flags' in RegExpPrototype) ? flags.call(R) : rf);
  }, { unsafe: true });
}
