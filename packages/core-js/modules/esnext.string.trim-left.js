'use strict';
// https://github.com/tc39/ecmascript-string-left-right-trim
require('./_string-trim')('trimLeft', function (internalTrim) {
  return function trimLeft() {
    return internalTrim(this, 1);
  };
}, 'trimStart');
