'use strict';
// https://github.com/psmarshall/string-replace-all-proposal
var context = require('../internals/string-context');

require('../internals/export')({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    return context(this, searchValue, 'replaceAll')
      .split(String(searchValue))
      .join(replaceValue);
  }
});
