var method = require('../array/virtual/pushed');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.pushed;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.pushed)) ? method : own;
};
