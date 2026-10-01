// inner `k = 'foo'` shadows the outer `k = 'iterator'`, so `Symbol[k]` inside `f` does
// NOT resolve to `Symbol.iterator` and the in-check is not rewritten to is-iterable.
// `Symbol` receiver still gets the constructor polyfill on legacy targets
const k = 'iterator';
function f() {
  const k = 'foo';
  return Symbol[k] in obj;
}
f();
