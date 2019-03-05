'use strict';
var requireObjectCoercible = require('../internals/require-object-coercible');
var isRegExp = require('../internals/is-regexp');
var getRegExpFlags = require('../internals/regexp-flags');
var ESCAPE_REGEXP = /[\\^$*+?.()|[\]{}]/g;

// `String.prototype.replaceAll` method
// https://github.com/tc39/proposal-string-replace-all
require('../internals/export')({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible(this);
    var search, flags;
    if (isRegExp(searchValue)) {
      flags = getRegExpFlags.call(searchValue);
      search = new RegExp(searchValue.source, ~flags.indexOf('g') ? flags : flags + 'g');
    } else {
      search = new RegExp(String(searchValue).replace(ESCAPE_REGEXP, '\\$&'), 'g');
    }
    return String(O).replace(search, replaceValue);
  }
});
