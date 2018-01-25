var shared = require('./shared')('keys');
var uid = require('./uid');

module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};
