// `function f({Array: {from}} = globalThis)` - default-value at function param position.
// Excluded from nested-proxy detection: a per-key destructure default would pick native
// first on modern engines (contradicting usage-pure's polyfill-always contract), but
// rewriting to a direct `const from = _Array$from` inside the body would break param-
// default semantics (the caller can pass a custom value). User must rewrite manually
// as `function f() { const from = _Array$from; ... }` to get the polyfill
export function f({ Array: { from } } = globalThis) {
  return from([1, 2, 3]);
}
