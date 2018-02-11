'use strict';
// `String.prototype.anchor` method
// https://tc39.github.io/ecma262/#sec-string.prototype.anchor
require('../internals/string-html')('anchor', function (createHTML) {
  return function anchor(name) {
    return createHTML(this, 'a', 'name', name);
  };
});
