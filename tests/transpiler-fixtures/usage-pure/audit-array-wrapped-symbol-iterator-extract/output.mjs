import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const it = _getIteratorMethod(arr);
// a `[Symbol.iterator]`-keyed binding under an ArrayPattern wrapper extracts through the
// iterator-method helper off the POSITIONAL init element, like the plain-declarator form:
// a rest sibling keeps the re-keyed sentinel in the preserved wrapper (array siblings and
// holes survive untouched); a fully-consumed pattern drops the whole declarator instead
const [{
  [_Symbol$iterator]: _unused,
  ...r
}, tail] = [arr, 0];
it;
r;
tail;
const single = _getIteratorMethod(other);
single;