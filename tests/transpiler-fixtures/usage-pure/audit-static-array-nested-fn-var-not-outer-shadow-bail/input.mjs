// the `var Array` lives in the nested function `inner`, so it does NOT shadow `Array` in
// `outer`; `outer`'s `Array.from = ...` write targets the GLOBAL - a genuine monkey-patch -
// so the top-level `Array.from(...)` bails. var-hoist stops at the function boundary
function outer() {
  function inner() { var Array = {}; }
  Array.from = function () {};
}
Array.from([1, 2, 3]);
