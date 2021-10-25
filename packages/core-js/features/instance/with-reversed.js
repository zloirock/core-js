var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/with-reversed');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withReversed;
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.withReversed)) ? method : own;
};
