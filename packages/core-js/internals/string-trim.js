var requireObjectCoercible = require('../internals/require-object-coercible');
var whitespace = '[' + require('../internals/whitespaces') + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
module.exports = function (string, TYPE) {
  string = String(requireObjectCoercible(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};
