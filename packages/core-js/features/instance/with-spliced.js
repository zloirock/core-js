var method = require('../array/virtual/with-spliced');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withSpliced;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.withSpliced)) ? method : own;
};
