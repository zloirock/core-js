'use strict';
// `String.prototype.sub` method
// https://tc39.github.io/ecma262/#sec-string.prototype.sub
require('./_string-html')('sub', function (createHTML) {
  return function sub() {
    return createHTML(this, 'sub', '', '');
  };
});
