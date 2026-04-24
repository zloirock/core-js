// nested symbol-in-computed-key probe: `obj[Symbol[Symbol.iterator]] in x`.
// the inner `Symbol[Symbol.iterator]` should emit the iterator-method polyfill and
// `Symbol` itself should polyfill - without Symbol reuse tripping a cycle guard
obj[Symbol[Symbol.iterator]] in x;
