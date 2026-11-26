'use strict';
var isCallable = require('../internals/is-callable');

// Babel recognizes its `typeof` helper directive only at the start of a function declaration.
function isObject(it) {
  '@babel/helpers - typeof';
  return typeof it == 'object' ? it !== null : isCallable(it);
}

module.exports = isObject;
