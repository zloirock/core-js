'use strict';
var getBuiltIn = require('../internals/get-built-in');
var hasOwn = require('../internals/has-own-property');
var isObject = require('../internals/is-object');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var shared = require('../internals/shared-store');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

// Babel recognizes its `typeof` helper directive only at the start of a function declaration.
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
  if (shared.symbols) {
    // Requiring internal-state here would introduce a cycle through to-property-key.
    var state = shared.state && shared.state.get(it);
    var key = shared.keys && shared.keys.state;
    if (!state && key && hasOwn(it, key)) state = it[key];
    return !!state && state.type === 'Symbol' && state.facade === it;
  }
  // An external Symbol shim can have its own objects and no core-js registry.
  var $Symbol = NATIVE_SYMBOL && getBuiltIn('Symbol');
  return !!$Symbol && isPrototypeOf($Symbol.prototype, it);
};
