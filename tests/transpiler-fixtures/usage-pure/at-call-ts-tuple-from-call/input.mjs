// `const [a, b] = f()` against `f(): [string[], number]`: destructuring positions must
// resolve against the tuple members (index-specific), not collapse to a common element
// type. a -> string[], so `a.at(0)` rewrites to `_atMaybeArray`.
function f(): [string[], number] {
  return [['a'], 1];
}
const [a, b] = f();
a.at(0);
