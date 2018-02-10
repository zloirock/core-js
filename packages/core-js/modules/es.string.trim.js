'use strict';
// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
require('./_string-trim')('trim', function (internalTrim) {
  return function trim() {
    return internalTrim(this, 3);
  };
});
