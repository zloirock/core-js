var DOMIterables = require('core-js-internals/dom-iterables');
var $iterators = require('./es.array.iterator');
var redefine = require('./_redefine');
var global = require('core-js-internals/global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wellKnownSymbol = require('core-js-internals/well-known-symbol');
var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = Iterators.Array;

for (var NAME in DOMIterables) {
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (DOMIterables[NAME]) for (var key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}
