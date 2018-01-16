var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var $ = require('./_state');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TEMPLATE = ('' + $toString).split(TO_STRING);

require('./_shared')('inspectSource', function (it) {
  return $toString.call(it);
});

(module.exports = function (O, key, val, unsafe) {
  if (typeof val == 'function') {
    if (!has(val, 'name')) hide(val, 'name', key);
    $(val, true).source = has(O, key) ? String(O[key]) : TEMPLATE.join(String(key));
  }
  if (O === global) {
    O[key] = val;
  } else if (!unsafe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && $(this).source || $toString.call(this);
});
