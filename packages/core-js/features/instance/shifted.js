var method = require('../array/virtual/shifted');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.shifted;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.shifted)) ? method : own;
};
