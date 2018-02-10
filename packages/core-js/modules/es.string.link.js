'use strict';
// `String.prototype.link` method
// https://tc39.github.io/ecma262/#sec-string.prototype.link
require('./_string-html')('link', function (createHTML) {
  return function link(url) {
    return createHTML(this, 'a', 'href', url);
  };
});
