// `let Array` is block-scoped to the inner block, so the `Array.from = ...` write in the
// function body OUTSIDE that block targets the GLOBAL - a genuine monkey-patch - so the
// top-level `Array.from(...)` must bail out of pure substitution. contrast: a function-scoped
// `var` shadow would suppress the mutation tracking and let the call substitute
function f() {
  {
    let Array = {};
  }
  Array.from = function () {};
}
Array.from([1, 2, 3]);