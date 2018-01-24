var shared = require('./_shared')('keys');
var uid = require('core-js-internals/uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};
