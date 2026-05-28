// Flatten on the first declarator with a sibling arrow that contains both a `globalThis`
// receiver-ref and an instance-method call `.values()`. The arrow body is rewritten into
// `{ var _ref; return _valuesMaybeArray(_ref = [...]).call(_ref); }` matched against the
// original source, while the `globalThis -> _globalThis` substitution targets text inside
// that same wrapped slice. If the substitution mutates the input the body wrap matches
// against, the wrap composition is dropped and a stray `)` from the original `.values()`
// call leaks into the emit, producing invalid syntax at runtime.
const { Array: { from } } = globalThis, val = () => [globalThis].values();
console.log(from, val());
