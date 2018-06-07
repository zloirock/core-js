// check on default Array iterator
var Iterators = require('../internals/iterators');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};
