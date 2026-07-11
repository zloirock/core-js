import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// `[Symbol.iterator]: {next}` - a nested ObjectPattern value consumes like the identifier
// form, destructuring the get-iterator-method RESULT (`{ next } = _getIteratorMethod(obj)`):
// value-correct on modern engines (the helper returns the same method a raw read yields) and
// polyfill-visible where a raw symbol read misses native iterators; the receiver keeps the
// user binding `obj`
const obj = _globalThis;
const from = _Array$from;
const {
  next
} = _getIteratorMethod(obj);
console.log(from, next);