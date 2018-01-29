// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('core-js-internals/is-regexp');
var requireObjectCoercible = require('core-js-internals/require-object-coercible');

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(requireObjectCoercible(that));
};
