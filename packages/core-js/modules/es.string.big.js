'use strict';
// `String.prototype.big` method
// https://tc39.github.io/ecma262/#sec-string.prototype.big
require('./_string-html')('big', function (createHTML) {
  return function big() {
    return createHTML(this, 'big', '', '');
  };
});
