var getBuiltIn = require('../../internals/get-built-in');

module.exports = function create(P, D) {
  return getBuiltIn('Object', 'create')(P, D);
};
