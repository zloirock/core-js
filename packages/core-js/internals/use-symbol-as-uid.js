'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

// Babel recognizes its `typeof` helper directive only at the start of a function declaration.
function canUseSymbol() {
  '@babel/helpers - typeof';
  return !Symbol.sham && typeof Symbol.iterator == 'symbol';
}

module.exports = NATIVE_SYMBOL && canUseSymbol();
