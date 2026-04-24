import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `Symbol[(0, 'iterator')]` - sequence expression with a pure preceding operand
// must fold to its last expression 'iterator', so the whole access is recognised
// as `Symbol.iterator` and the iterator polyfill is injected
const x = _Symbol$iterator;