'use strict';
// `String.prototype.strike` method
// https://tc39.github.io/ecma262/#sec-string.prototype.strike
require('./_string-html')('strike', function (createHTML) {
  return function strike() {
    return createHTML(this, 'strike', '', '');
  };
});
