import _isIterable from "@core-js/pure/actual/is-iterable";
import _Array$from from "@core-js/pure/actual/array/from";
// `Symbol.iterator in X` appears at module scope, inside an arrow body, and inside
// a class method. handleBinaryIn must produce a single deduplicated `_isIterable` import
// while still rewriting each occurrence at its own location.
const top = _isIterable(src1);
const arrow = () => _isIterable(src2);
class Box {
  has() {
    return _isIterable(this.data);
  }
  load() {
    return _Array$from(this.data);
  }
}
export { top, arrow, Box };