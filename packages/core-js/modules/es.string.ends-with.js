'use strict';
var $ = require('../internals/export');
var toLength = require('../internals/to-length');
var validateArguments = require('../internals/validate-string-method-arguments');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

var ENDS_WITH = 'endsWith';
var nativeEndsWith = ''[ENDS_WITH];
var min = Math.min;

// `String.prototype.endsWith` method
// https://tc39.github.io/ecma262/#sec-string.prototype.endswith
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic(ENDS_WITH) }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = validateArguments(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : min(toLength(endPosition), len);
    var search = String(searchString);
    return nativeEndsWith
      ? nativeEndsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});
