import _Array$from from "@core-js/pure/actual/array/from";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol.iterator in X` appears at module scope, inside an arrow body, and inside
// a class method. Each occurrence rewrites independently while a single deduplicated
// `_isIterable` import covers all of them.
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