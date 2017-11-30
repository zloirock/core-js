'use strict';
// https://github.com/psmarshall/string-replace-all-proposal
var $export = require('./_export');
var context = require('./_string-context');

$export($export.P, 'String', {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    return context(this, searchValue, 'replaceAll')
      .split(String(searchValue))
      .join(replaceValue);
  }
});
