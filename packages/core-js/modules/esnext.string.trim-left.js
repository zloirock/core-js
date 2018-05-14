'use strict';
// `String.prototype.{ trimLeft, trimStart }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
require('../internals/string-trim')('trimStart', function (internalTrim) {
  return function trimStart() {
    return internalTrim(this, 1);
  };
}, 'trimLeft');
