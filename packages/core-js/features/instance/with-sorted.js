var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/with-sorted');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withSorted;
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.withSorted)) ? method : own;
};
