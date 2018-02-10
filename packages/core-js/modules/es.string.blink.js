'use strict';
// `String.prototype.blink` method
// https://tc39.github.io/ecma262/#sec-string.prototype.blink
require('./_string-html')('blink', function (createHTML) {
  return function blink() {
    return createHTML(this, 'blink', '', '');
  };
});
