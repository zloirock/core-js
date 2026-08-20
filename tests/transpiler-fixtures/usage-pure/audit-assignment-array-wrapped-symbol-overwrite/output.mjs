import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a `[Symbol.iterator]`-keyed target in a destructuring ASSIGNMENT under an ArrayPattern
// wrapper has no declaration to host an extraction - the destructure assigns natively
// first, then a post-statement overwrite rebinds the target through the iterator-method
// helper so the polyfill wins
let it, r;
[{
  [_Symbol$iterator]: it,
  ...r
}] = [arr];
it = _getIteratorMethod(arr);
it;
r;