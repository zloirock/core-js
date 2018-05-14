'use strict';
// @@search logic
require('../internals/fix-regexp-well-known-symbol-logic')('search', 1, function (defined, SEARCH, nativeSearch) {
  // `String.prototype.search` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.search
  return [function search(regexp) {
    var O = defined(this);
    var searcher = regexp == undefined ? undefined : regexp[SEARCH];
    return searcher !== undefined ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, nativeSearch];
});
