'use strict';
// @@match logic
require('../internals/fix-regexp-well-known-symbol-logic')('match', 1, function (defined, MATCH, nativeMatch) {
  // `String.prototype.match` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.match
  return [function match(regexp) {
    var O = defined(this);
    var matcher = regexp == undefined ? undefined : regexp[MATCH];
    return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, nativeMatch];
});
