var global = require('core-js-internals/global');
var hide = require('./_hide');
var has = require('core-js-internals/has');
var $ = require('./_state');
var TO_STRING = 'toString';
var nativeFunctionToString = Function[TO_STRING];
var TEMPLATE = String(nativeFunctionToString).split(TO_STRING);

require('core-js-internals/shared')('inspectSource', function (it) {
  return nativeFunctionToString.call(it);
});

(module.exports = function (O, key, value, unsafe) {
  if (typeof value == 'function') {
    if (!has(value, 'name')) hide(value, 'name', key);
    $(value, true).source = has(O, key) ? String(O[key]) : TEMPLATE.join(String(key));
  }
  if (O === global) {
    O[key] = value;
  } else if (!unsafe) {
    delete O[key];
    hide(O, key, value);
  } else if (O[key]) {
    O[key] = value;
  } else {
    hide(O, key, value);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && $(this).source || nativeFunctionToString.call(this);
});
