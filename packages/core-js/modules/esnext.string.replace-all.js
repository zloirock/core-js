'use strict';
var hide = require('../internals/hide');
var requireObjectCoercible = require('../internals/require-object-coercible');
var anObject = require('../internals/an-object');
var isRegExp = require('../internals/is-regexp');
var getRegExpFlags = require('../internals/regexp-flags');
var speciesConstructor = require('../internals/species-constructor');
var REPLACE_ALL = require('../internals/well-known-symbol')('replaceAll');
var IS_PURE = require('../internals/is-pure');
var RegExpPrototype = RegExp.prototype;

var $replaceAll = function (string, replaceValue) {
  var rx = anObject(this);
  var flags = String('flags' in RegExpPrototype ? rx.flags : getRegExpFlags.call(rx));
  if (!~flags.indexOf('g')) {
    rx = new (speciesConstructor(rx, RegExp))(rx.source, flags + 'g');
  }
  return String(string).replace(rx, replaceValue);
};

// `String.prototype.replaceAll` method
// https://github.com/tc39/proposal-string-replace-all
require('../internals/export')({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible(this);
    var replacer, string, searchString, template, result, i;
    if (searchValue != null) {
      replacer = searchValue[REPLACE_ALL];
      if (replacer !== undefined) {
        return replacer.call(searchValue, O, replaceValue);
      } else if (IS_PURE && isRegExp(searchValue)) {
        return $replaceAll.call(searchValue, O, replaceValue);
      }
    }
    string = String(O);
    searchString = String(searchValue);
    template = string.split(searchString);
    if (typeof replaceValue !== 'function') {
      return template.join(String(replaceValue));
    }
    result = template[0];
    for (i = 1; i < template.length; i++) {
      result += String(replaceValue(searchString, i - 1, string));
      result += template[i];
    }
    return result;
  }
});

IS_PURE || REPLACE_ALL in RegExpPrototype || hide(RegExpPrototype, REPLACE_ALL, $replaceAll);
