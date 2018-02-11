// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var toLength = require('core-js-internals/to-length');
var context = require('../internals/string-context');
var STARTS_WITH = 'startsWith';
var FAILS_IS_REGEXP = require('../internals/fails-is-regexp')(STARTS_WITH);
var nativeStartsWith = ''[STARTS_WITH];

// `String.prototype.startsWith` method
// https://tc39.github.io/ecma262/#sec-string.prototype.startswith
require('../internals/export')({ target: 'String', proto: true, forced: FAILS_IS_REGEXP }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = context(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return nativeStartsWith
      ? nativeStartsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});
