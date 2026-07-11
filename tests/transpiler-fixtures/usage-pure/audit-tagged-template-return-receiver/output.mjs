import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a USER tagged-template return as the receiver: the tag's return type is unknowable, so
// the dispatch must stay GENERIC (a mistyped Maybe would throw when the tag returns the
// other type); the call-rooted receiver memoizes for the `.call` re-read
function tag(strings) {
  return strings[0];
}
export const r = _at(_ref = tag`x`).call(_ref, 0);