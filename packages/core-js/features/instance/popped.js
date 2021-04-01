var method = require('../array/virtual/popped');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.popped;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.popped)) ? method : own;
};
