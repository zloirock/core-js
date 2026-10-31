import _at from "@core-js/pure/actual/instance/at";
// a reassignment inside a DEFERRED (non-IIFE) function runs at an unknown time - here `f`
// runs before the use via `g()` though it sits textually after it - so the positional straight-line
// narrow cannot be trusted -> generic `_at`. an IIFE-body reassignment (immediately-invoked) still
// narrows, since it lands at a straight-line position
let v;
v = [1, 2];
g();
_at(v).call(v, 0);
function f() {
  v = "s";
}
function g() {
  f();
}