var DOMIterables = require('./_dom-iterables');
var forEach = require('./_array-for-each');
var redefine = require('./_redefine');
var global = require('core-js-internals/global');

for (var NAME in DOMIterables) {
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto.forEach) redefine(proto, 'forEach', forEach);
}
