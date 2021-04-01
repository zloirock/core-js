var method = require('../array/virtual/spliced');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.spliced;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.spliced)) ? method : own;
};
