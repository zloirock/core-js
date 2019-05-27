'use strict';
var $ = require('../internals/export');
var validateArguments = require('../internals/validate-string-method-arguments');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

// `String.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-string.prototype.includes
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~validateArguments(this, searchString, 'includes')
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});
