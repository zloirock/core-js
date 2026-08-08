import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const it = _getIteratorMethod(arr);
// a `[Symbol.iterator]`-keyed binding nested under an object property extracts off the
// receiver walked along the nesting keys: a rest sibling keeps the re-keyed sentinel in
// the surviving residual; a sole-binding pattern with an effect-free init drops the whole
// declarator, leaving only the extracted binding
const {
  y: {
    [_Symbol$iterator]: _unused,
    ...r
  }
} = {
  y: arr
};
it;
r;
const single = _getIteratorMethod(other);
single;