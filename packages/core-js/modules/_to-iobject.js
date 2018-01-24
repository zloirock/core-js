// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var requireObjectCoercible = require('core-js-internals/require-object-coercible');

module.exports = function (it) {
  return IObject(requireObjectCoercible(it));
};
