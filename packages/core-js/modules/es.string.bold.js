'use strict';
// `String.prototype.bold` method
// https://tc39.github.io/ecma262/#sec-string.prototype.bold
require('./_string-html')('bold', function (createHTML) {
  return function bold() {
    return createHTML(this, 'b', '', '');
  };
});
