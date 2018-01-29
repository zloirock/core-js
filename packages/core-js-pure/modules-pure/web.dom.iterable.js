require('./es.array.iterator');
var DOMIterables = require('core-js-internals/dom-iterables');
var global = require('core-js-internals/global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('core-js-internals/well-known-symbol')('toStringTag');

for (var NAME in DOMIterables) {
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
