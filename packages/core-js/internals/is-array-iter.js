// check on default Array iterator
var Iterators = require('../internals/iterators');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
