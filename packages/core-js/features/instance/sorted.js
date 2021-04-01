var method = require('../array/virtual/sorted');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.sorted;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.sorted)) ? method : own;
};
