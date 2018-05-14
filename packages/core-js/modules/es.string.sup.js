'use strict';
// `String.prototype.sup` method
// https://tc39.github.io/ecma262/#sec-string.prototype.sup
require('../internals/string-html')('sup', function (createHTML) {
  return function sup() {
    return createHTML(this, 'sup', '', '');
  };
});
