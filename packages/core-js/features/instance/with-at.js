var isPrototypeOf = require('../../internals/object-is-prototype-of');
var method = require('../array/virtual/with-at');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withAt;
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.withAt)) ? method : own;
};
