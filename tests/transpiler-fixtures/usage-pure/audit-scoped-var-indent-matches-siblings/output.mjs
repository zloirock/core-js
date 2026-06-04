import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// optional-chain `.flat?.().at` inside a nested block requires `_ref` for safe-call
// caching. the queued `var _ref;` insertion at block start must pick up surrounding
// sibling indent, not start at column 0 - matches the inline-baked path's indent
function probe(arr) {
  if (arr) {
    var _ref;
    const head = new (null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref.call(arr)))(0);
    return head;
  }
  return null;
}
export { probe };