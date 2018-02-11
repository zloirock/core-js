'use strict';
// https://github.com/tc39/ecmascript-string-left-right-trim
require('../internals/string-trim')('trimRight', function (internalTrim) {
  return function trimRight() {
    return internalTrim(this, 2);
  };
}, 'trimEnd');
