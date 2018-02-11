var DOMIterables = require('core-js-internals/dom-iterables');
var forEach = require('../internals/array-for-each');
var redefine = require('../internals/redefine');
var global = require('core-js-internals/global');

for (var NAME in DOMIterables) {
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto.forEach) redefine(proto, 'forEach', forEach);
}
