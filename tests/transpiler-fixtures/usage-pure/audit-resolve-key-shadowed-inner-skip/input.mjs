// inner `k = 'foo'` shadows the outer `k = 'iterator'`, so `Symbol[k] in obj`
// inside `f` is not recognised as `Symbol.iterator in obj` and no polyfill
// is injected
const k = 'iterator';
function f() {
  const k = 'foo';
  return Symbol[k] in obj;
}
f();
