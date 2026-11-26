'use strict';
var isCallable = require('../internals/is-callable');

// eslint-disable-next-line unicorn/consistent-function-style -- Babel reads the typeof directive on declarations
function isObject(it) {
  '@babel/helpers - typeof';
  return typeof it == 'object' ? it !== null : isCallable(it);
}

module.exports = isObject;
