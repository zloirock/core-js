'use strict';
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var fails = require('../internals/fails');
var requireObjectCoercible = require('../internals/require-object-coercible');
var wellKnownSymbol = require('../internals/well-known-symbol');

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);
  var methods = exec(requireObjectCoercible, SYMBOL, ''[KEY]);
  var stringMethod = methods[0];
  var regexMethod = methods[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
    // TODO: This line makes the tests fail:
    //       ReferenceError: Can't find variable: Reflect
    // hide(RegExp.prototype[SYMBOL], 'name', '[Symbol.' + KEY + ']');
    if (sham) hide(RegExp.prototype[SYMBOL], 'sham', true);
  }
};
