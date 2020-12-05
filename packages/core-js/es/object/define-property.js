var getBuiltIn = require('../../internals/get-built-in');

module.exports = function defineProperty(O, P, Attributes) {
  return getBuiltIn('Object', 'defineProperty')(O, P, Attributes);
};
