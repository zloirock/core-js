var DOMIterables = require('../internals/dom-iterables');
var forEach = require('../internals/array-for-each');
var redefine = require('../internals/redefine');
var global = require('../internals/global');

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype && !CollectionPrototype.forEach) {
    redefine(CollectionPrototype, 'forEach', forEach);
  }
}
