'use strict';
// `String.prototype.small` method
// https://tc39.github.io/ecma262/#sec-string.prototype.small
require('./_string-html')('small', function (createHTML) {
  return function small() {
    return createHTML(this, 'small', '', '');
  };
});
