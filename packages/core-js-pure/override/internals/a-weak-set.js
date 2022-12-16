var tryToString = require('../internals/try-to-string');

module.exports = function (it) {
  if (typeof it == 'object' && 'has' in it && 'add' in it && 'delete' in it) return it;
  throw TypeError(tryToString(it) + ' is not a weakset');
};
