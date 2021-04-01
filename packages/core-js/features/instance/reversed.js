var method = require('../array/virtual/reversed');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.reversed;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.reversed)) ? method : own;
};
