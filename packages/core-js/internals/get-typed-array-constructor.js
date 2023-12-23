'use strict';
var isObject = require('../internals/is-object');
var hasOwn = require('../internals/has-own-property');
var getInternalState = require('../internals/array-buffer-view-core').getInternalState;

var getPrototypeOf = Object.getPrototypeOf;
var TYPED_ARRAY_CONSTRUCTOR = 'TypedArrayConstructor';

var getTypedArrayConstructor = function (it) {
  var proto = getPrototypeOf(it);
  if (!isObject(proto)) return;
  var state = getInternalState(proto);
  return (state && hasOwn(state, TYPED_ARRAY_CONSTRUCTOR)) ? state[TYPED_ARRAY_CONSTRUCTOR] : getTypedArrayConstructor(proto);
};

module.exports = getTypedArrayConstructor;
