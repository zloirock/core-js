var method = require('../array/virtual/with-sorted');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withSorted;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.withSorted)) ? method : own;
};
