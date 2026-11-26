'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

// eslint-disable-next-line unicorn/consistent-function-style -- Babel reads the typeof directive on declarations
function canUseSymbol() {
  '@babel/helpers - typeof';
  return !Symbol.sham && typeof Symbol.iterator == 'symbol';
}

module.exports = NATIVE_SYMBOL && canUseSymbol();
