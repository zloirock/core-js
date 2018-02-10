'use strict';
// `String.prototype.italics` method
// https://tc39.github.io/ecma262/#sec-string.prototype.italics
require('./_string-html')('italics', function (createHTML) {
  return function italics() {
    return createHTML(this, 'i', '', '');
  };
});
