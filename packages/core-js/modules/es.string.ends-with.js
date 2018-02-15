'use strict';
var toLength = require('../internals/to-length');
var validateArguments = require('../internals/validate-string-method-arguments');
var ENDS_WITH = 'endsWith';
var CORRECT_IS_REGEXP_LOGIC = require('../internals/correct-is-regexp-logic')(ENDS_WITH);
var nativeEndsWith = ''[ENDS_WITH];

// `String.prototype.endsWith` method
// https://tc39.github.io/ecma262/#sec-string.prototype.endswith
require('../internals/export')({ target: 'String', proto: true, forced: !CORRECT_IS_REGEXP_LOGIC }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = validateArguments(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return nativeEndsWith
      ? nativeEndsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});
