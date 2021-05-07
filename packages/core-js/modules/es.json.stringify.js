var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var fails = require('../internals/fails');
var isObject = require('../internals/is-object');
var isSymbol = require('../internals/is-symbol');
var NATIVE_SYMBOL = require('../internals/native-symbol');

// eslint-disable-next-line es/no-array-isarray -- safe
var isArray = Array.isArray;
var $stringify = getBuiltIn('JSON', 'stringify');
var re = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function () {
  var symbol = getBuiltIn('Symbol')();
  // MS Edge converts symbol values to JSON as {}
  return $stringify([symbol]) != '[null]'
    // WebKit converts symbol values to JSON as null
    || $stringify({ a: symbol }) != '{}'
    // V8 throws on boxed symbols
    || $stringify(Object(symbol)) != '{}';
});

var ILL_FORMED_UNICODE = fails(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

var stringifyWithSymbols = function (it, replacer) {
  var args = [it];
  var index = 1;
  var $replacer = replacer;
  while (arguments.length > index) args.push(arguments[index++]);
  if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
  if (!isArray(replacer)) replacer = function (key, value) {
    if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
    if (!isSymbol(value)) return value;
  };
  args[1] = replacer;
  return $stringify.apply(null, args);
};

var fixIllFormed = function (match, offset, string) {
  var prev = string.charAt(offset - 1);
  var next = string.charAt(offset + 1);
  if ((low.test(match) && !hi.test(next)) || (hi.test(match) && !low.test(prev))) {
    return '\\u' + match.charCodeAt(0).toString(16);
  } return match;
};

// `JSON.stringify` method, behavior with symbols and preventing from returning ill-formed Unicode strings
// https://tc39.es/ecma262/#sec-json.stringify
// https://github.com/tc39/proposal-well-formed-stringify
$({ target: 'JSON', stat: true, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  stringify: function stringify(it, replacer, space) {
    var result = (WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbols : $stringify).apply(null, arguments);
    return ILL_FORMED_UNICODE && typeof result == 'string' ? result.replace(re, fixIllFormed) : result;
  },
});
