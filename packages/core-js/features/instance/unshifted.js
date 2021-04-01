var method = require('../array/virtual/unshifted');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.unshifted;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.unshifted)) ? method : own;
};
