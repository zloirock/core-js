'use strict';
// https://github.com/psmarshall/string-replace-all-proposal
var context = require('./_string-context');

require('./_export')({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    return context(this, searchValue, 'replaceAll')
      .split(String(searchValue))
      .join(replaceValue);
  }
});
