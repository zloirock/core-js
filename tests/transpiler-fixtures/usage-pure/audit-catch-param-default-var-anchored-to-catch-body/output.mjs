import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// optional-chain `.flat?.().at` inside catch-param destructure default needs `_ref` to
// cache the safe-call result for both null check and follow-up access. the resolvable
// key forces the receiver extraction, and the var-scope walk passes through CatchClause
// (param-subtree refs don't have body as ancestor); the anchor must recognize
// CatchClause so `var _ref;` lands inside the catch body
function probe(arr) {
  try {
    throw {};
  } catch (_ref) {
    var _ref2, _ref3;
    let at = (_ref2 = _at(_ref)) === void 0 ? null == (_ref3 = _flatMaybeArray(arr)) ? void 0 : _at(_ref3.call(arr)) : _ref2;
    return at;
  }
}
export { probe };