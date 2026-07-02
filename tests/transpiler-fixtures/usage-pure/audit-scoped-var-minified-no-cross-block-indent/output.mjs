import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// minified single-line function body followed by an indented sibling: indent detector
// must bail at `}` so the inserted `var _ref;` doesn't pick up the unrelated next-block
// indent (`  nextLine` belongs to a sibling scope, not this body)
function probe(arr) {
  var _ref;
  return new (null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref.call(arr)))(0);
}
function nextLine() {}
export { probe, nextLine };