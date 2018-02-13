'use strict';
var context = require('../internals/string-context');
var INCLUDES = 'includes';
var CORRECT_IS_REGEXP_LOGIC = require('../internals/correct-is-regexp-logic')(INCLUDES);

// `String.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-string.prototype.includes
require('../internals/export')({ target: 'String', proto: true, forced: !CORRECT_IS_REGEXP_LOGIC }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});
