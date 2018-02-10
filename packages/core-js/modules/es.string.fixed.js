'use strict';
// `String.prototype.fixed` method
// https://tc39.github.io/ecma262/#sec-string.prototype.fixed
require('./_string-html')('fixed', function (createHTML) {
  return function fixed() {
    return createHTML(this, 'tt', '', '');
  };
});
