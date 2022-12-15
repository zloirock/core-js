var iterateSimple = require('../internals/iterate-simple');

module.exports = function (set, fn, interruptible) {
  return interruptible ? iterateSimple(set.keys(), fn) : set.forEach(fn);
};
