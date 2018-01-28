// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('./indexed-object');
var requireObjectCoercible = require('./require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};
