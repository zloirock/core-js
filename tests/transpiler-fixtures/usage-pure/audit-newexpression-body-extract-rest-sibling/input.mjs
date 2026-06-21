// NewExpression as default-value with a rest sibling: `{from, ...rest} = new Foo()`.
// `new Foo()` is not statically classifiable, so no body-extract and no polyfill import
// is emitted - safe under-inject (the ctor may return a shape unrelated to `Array`).
// distinct keys (`from` / `of`) verify neither triggers a spurious rest-sibling polyfill.
function Foo() { return Array; }
function run({ from, ...rest } = new Foo()) {
  return [from([1]), rest];
}
function emit({ of, ...rest } = new Foo()) {
  return [of(2, 3), rest];
}
export { run, emit };
