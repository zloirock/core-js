var method = require('../array/virtual/with-at');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withAt;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.withAt)) ? method : own;
};
