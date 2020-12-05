var getBuiltIn = require('../../internals/get-built-in');

module.exports = function defineProperties(T, D) {
  return getBuiltIn('Object', 'defineProperties')(T, D);
};
