'use strict';

var anObject = require('../internals/an-object');
var sameValue = require('../internals/same-value');
var nativeExec = RegExp.prototype.exec;

// @@search logic
require('../internals/fix-regexp-well-known-symbol-logic')('search', 1, function (defined, SEARCH, nativeSearch) {
  return [
    // `String.prototype.search` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = defined(this);
      var searcher = regexp == undefined ? undefined : regexp[SEARCH];
      return searcher !== undefined ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
    function Symbol$search(regexp) {
      if (regexp.exec === nativeExec) return nativeSearch.call(this, regexp);

      var rx = anObject(regexp);
      var S = String(this);

      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = rx.exec(S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});
