'use strict';
// `String.prototype.{ trimLeft, trimStart }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
require('../internals/string-trim')('trimLeft', function (internalTrim) {
  return function trimLeft() {
    return internalTrim(this, 1);
  };
}, 'trimStart');
