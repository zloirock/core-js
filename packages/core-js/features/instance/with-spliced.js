var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/with-spliced');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withSpliced;
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.withSpliced)) ? method : own;
};
