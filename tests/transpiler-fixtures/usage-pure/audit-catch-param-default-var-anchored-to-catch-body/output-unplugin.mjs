import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// optional-chain `.flat?.().at` inside catch-param destructure default needs `_ref` to
// cache the safe-call result for both null check and follow-up access. the var-scope
// walk passes through CatchClause (param-subtree refs don't have body as ancestor); the
// anchor must recognize CatchClause so `var _ref;` lands inside the catch body
function probe(arr) {
  try {
    throw {};
  } catch ({ a = null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref.call(arr)) }) {
    var _ref;
    return a;
  }
}
export { probe };