'use strict';
// @@replace logic
require('../internals/fix-re-wks')('replace', 2, function (defined, REPLACE, nativeReplace) {
  // `String.prototype.replace` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
  return [function replace(searchValue, replaceValue) {
    var O = defined(this);
    var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
    return replacer !== undefined
      ? replacer.call(searchValue, O, replaceValue)
      : nativeReplace.call(String(O), searchValue, replaceValue);
  }, nativeReplace];
});
