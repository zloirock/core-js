'use strict';
var getBuiltIn = require('../internals/get-built-in');
var hasOwn = require('../internals/has-own-property');
var isObject = require('../internals/is-object');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var shared = require('../internals/shared-store');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

// eslint-disable-next-line unicorn/consistent-function-style -- Babel reads the typeof directive on declarations
function isNativeSymbol(it) {
  '@babel/helpers - typeof';
  return typeof it == 'symbol';
}

module.exports = USE_SYMBOL_AS_UID ? isNativeSymbol : function (it) {
  // Standalone well-known symbol entries can expose their string keys before Symbol is installed.
  if (typeof it === 'string') {
    var wks = shared.wks;
    for (var name in wks) {
      if (hasOwn(wks, name) && wks[name] === it) return true;
    }
    return false;
  }
  if (!isObject(it)) return false;
  if (shared.symbols && shared.state) {
    var state = shared.state.get(it);
    return !!state && state.type === 'Symbol';
  }
  // An external Symbol shim can have its own objects and no core-js registry.
  var $Symbol = NATIVE_SYMBOL && getBuiltIn('Symbol');
  return !!$Symbol && isPrototypeOf($Symbol.prototype, it);
};
