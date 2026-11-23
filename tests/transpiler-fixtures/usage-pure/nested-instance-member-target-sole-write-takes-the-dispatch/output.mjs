import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A nested instance claim whose member target is the assignment's only write takes the dispatch in the
// statement's place: the setter runs once, with the polyfill. A sibling reads the same captured
// receiver after the write. An effectful key keeps its place before the target.
const target = {};
const arr = [1, 2];
target.at = _atMaybeArray(arr);
target.flat = _flatMaybeArray(arr);
let sibling;
({
  C: _ref
} = {
  C: arr
});
target.includes = _includesMaybeArray(_ref), {
  sibling
} = _ref;
({
  C: {
    [(log(), 'findLast')]: target.findLast
  }
} = {
  C: arr
});
export { target, sibling };