// the `Array.from = ...` write targets a function-local `var Array` (hoisted to `inner` from
// its nested block), so it does NOT mutate the global - the top-level `Array.from` call is the
// genuine global and must still substitute to the pure import
function inner() {
  {
    var Array = {};
  }
  Array.from = function () {};
}
Array.from([1, 2, 3]);
