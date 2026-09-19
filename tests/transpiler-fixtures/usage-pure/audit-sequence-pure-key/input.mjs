// `Symbol[(0, 'iterator')]` - sequence expression with a pure preceding operand
// must fold to its last expression 'iterator', so the whole access is recognised
// as `Symbol.iterator` and the iterator polyfill is injected
const x = Symbol[(0, 'iterator')];
