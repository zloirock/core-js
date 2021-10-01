var method = require('../array/virtual/with-reversed');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.withReversed;
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.withReversed)) ? method : own;
};
