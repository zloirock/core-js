'use strict';
var requireObjectCoercible = require('../internals/require-object-coercible');
var isRegExp = require('../internals/is-regexp');
var getRegExpFlags = require('../internals/regexp-flags');
var speciesConstructor = require('../internals/species-constructor');

// `String.prototype.replaceAll` method
// https://github.com/tc39/proposal-string-replace-all
require('../internals/export')({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible(this);
    var search, flags;
    if (isRegExp(searchValue)) {
      flags = getRegExpFlags.call(searchValue);
      if (!~flags.indexOf('g')) {
        search = new (speciesConstructor(searchValue, RegExp))(searchValue.source, flags + 'g');
      } else search = searchValue;
      return String(O).replace(search, replaceValue);
    }
    return String(O).split(searchValue).join(replaceValue);
  }
});
