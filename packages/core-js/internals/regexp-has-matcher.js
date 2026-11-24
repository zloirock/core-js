'use strict';
var call = require('../internals/function-call');
var isObject = require('../internals/is-object');
var getNativeSource = require('../internals/regexp-native-source');
var shared = require('../internals/shared');

var RegExpPrototype = RegExp.prototype;

var legacyMatcher = function (method) {
  var STOP = { toString: function () { throw STOP; } };
  var check = function (it) {
    try {
      call(method, it, STOP);
    } catch (error) {
      if (error === STOP) return true;
    }
  };
  var re = /./g;
  re.lastIndex = 1;
  // Old V8 compile converts the input on a non-RegExp. PhantomJS exec resets lastIndex on error.
  if (method && !check({}) && check(re) && re.lastIndex === 1) return check;
};

var check = getNativeSource || legacyMatcher(shared('native-regexp-exec', RegExpPrototype.exec))
  // eslint-disable-next-line es/no-regexp-prototype-compile -- fallback for legacy exec
  || legacyMatcher(RegExpPrototype.compile);

module.exports = check && function (it) {
  if (isObject(it) && it !== RegExpPrototype) try {
    return check(it) !== undefined;
  } catch (error) { /* incompatible receiver */ }
  return false;
};
