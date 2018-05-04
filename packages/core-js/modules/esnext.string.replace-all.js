'use strict';
var validateArguments = require('../internals/validate-string-method-arguments');

// `String.prototype.replaceAll` method
// https://github.com/psmarshall/string-replace-all-proposal
require('../internals/export')({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    return validateArguments(this, searchValue, 'replaceAll')
      .split(String(searchValue))
      .join(replaceValue);
  }
});
