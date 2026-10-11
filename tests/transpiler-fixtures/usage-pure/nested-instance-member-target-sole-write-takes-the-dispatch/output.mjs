import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A nested instance claim whose member target is the assignment's only write takes the dispatch in the
// statement's place: the setter runs once, with the polyfill. Beside a sibling the target stays native,
// so its write keeps its order; an effectful key keeps the slot, and the target with it.
const target = {};
const arr = [1, 2];
target.at = _atMaybeArray(arr);
target.flat = _flatMaybeArray(arr);
let sibling;
({
  C: {
    includes: target.includes,
    sibling
  }
} = {
  C: arr
});
({
  C: {
    [(log(), 'findLast')]: target.findLast
  }
} = {
  C: arr
});
export { target, sibling };