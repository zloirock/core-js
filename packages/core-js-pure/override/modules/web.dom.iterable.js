require('./es.array.iterator');
var DOMIterables = require('../internals/dom-iterables');
var global = require('../internals/global');
var hide = require('../internals/hide');
var Iterators = require('../internals/iterators');
var TO_STRING_TAG = require('../internals/well-known-symbol')('toStringTag');

for (var NAME in DOMIterables) {
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
