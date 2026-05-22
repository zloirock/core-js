// NewExpression as default-value with a rest sibling: `{from, ...rest} = new Foo()`.
// the receiver is not statically classifiable (we can't know what `new Foo()` returns),
// so the resolver bails before body-extract is considered. user-written shape is
// preserved verbatim with no polyfill import emitted - safe under-inject (caller's
// `Foo()` may return a custom shape unrelated to `Array`). distinct keys (`from` / `of`)
// verify that neither key triggers a spurious polyfill through the rest-sibling path
function Foo() {
  return Array;
}
function run({
  from,
  ...rest
} = new Foo()) {
  return [from([1]), rest];
}
function emit({
  of,
  ...rest
} = new Foo()) {
  return [of(2, 3), rest];
}
export { run, emit };