var method = require('../array/virtual/with');

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it['with'];
  return (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype['with'])) ? method : own;
};
