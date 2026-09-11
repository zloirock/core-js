// runtime mutation of the static via Object.defineProperty with a literal key
// is semantically equivalent to a direct assignment. the resolver must detect
// the shape so the subsequent call is preserved verbatim, matching runtime
// semantics where the descriptor's value overrides the built-in.
Object.defineProperty(Array, "from", {
  value: function () {
    return [];
  }
});
Array.from([1, 2, 3]);