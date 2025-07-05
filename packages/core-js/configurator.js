'use strict';
var hasOwn = require('./internals/has-own-property');
var shared = require('./internals/shared-store');

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR_PROTOTYPE = 'AsyncIteratorPrototype';

module.exports = function (options) {
  if (typeof options == 'object') {
    if (hasOwn(options, USE_FUNCTION_CONSTRUCTOR)) {
      shared[USE_FUNCTION_CONSTRUCTOR] = !!options[USE_FUNCTION_CONSTRUCTOR];
    }
    if (hasOwn(options, ASYNC_ITERATOR_PROTOTYPE)) {
      shared[ASYNC_ITERATOR_PROTOTYPE] = options[ASYNC_ITERATOR_PROTOTYPE];
    }
  }
};
