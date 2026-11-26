'use strict';
var getBuiltIn = require('../internals/get-built-in');
var isCallable = require('../internals/is-callable');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var $Object = Object;

// Babel recognizes its `typeof` helper directive only at the start of a function declaration.
function isNativeSymbol(it) {
  '@babel/helpers - typeof';
  return typeof it == 'symbol';
}

module.exports = USE_SYMBOL_AS_UID ? isNativeSymbol : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};
