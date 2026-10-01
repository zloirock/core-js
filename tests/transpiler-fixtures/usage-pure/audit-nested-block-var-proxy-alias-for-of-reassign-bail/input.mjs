// A for-of head can replace the hoisted realm alias, or leave its initializer when empty.
// Pure must keep the live constructor read and guard its static; a direct fold would
// discard the replacement value and its native behavior.
function f(arr) {
  {
    var g = globalThis;
  }
  for (g of arr) {}
  g.Array.from([1, 2, 3]);
}
f([]);
