'use strict';
// `String.prototype.{ trimRight, trimEnd }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
require('../internals/string-trim')('trimEnd', function (internalTrim) {
  return function trimEnd() {
    return internalTrim(this, 2);
  };
}, 'trimRight');
