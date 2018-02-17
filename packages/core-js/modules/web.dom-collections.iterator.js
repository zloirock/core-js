var DOMIterables = require('../internals/dom-iterables');
var ArrayIteratorMethods = require('../modules/es.array.iterator');
var redefine = require('../internals/redefine');
var global = require('../internals/global');
var hide = require('../internals/hide');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');
var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = Iterators.Array;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype) {
    if (!CollectionPrototype[ITERATOR]) hide(CollectionPrototype, ITERATOR, ArrayValues);
    if (!CollectionPrototype[TO_STRING_TAG]) hide(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    Iterators[COLLECTION_NAME] = ArrayValues;
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      if (!CollectionPrototype[METHOD_NAME]) {
        redefine(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME], true);
      }
    }
  }
}
