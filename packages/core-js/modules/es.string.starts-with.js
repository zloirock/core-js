'use strict';
var $ = require('../internals/export');
var toLength = require('../internals/to-length');
var validateArguments = require('../internals/validate-string-method-arguments');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

var STARTS_WITH = 'startsWith';
var nativeStartsWith = ''[STARTS_WITH];

// `String.prototype.startsWith` method
// https://tc39.github.io/ecma262/#sec-string.prototype.startswith
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic(STARTS_WITH) }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = validateArguments(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return nativeStartsWith
      ? nativeStartsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});
