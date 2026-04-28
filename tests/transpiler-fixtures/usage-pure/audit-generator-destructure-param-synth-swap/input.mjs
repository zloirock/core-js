// generator function destructure default + synth-swap. plugin builds a synthetic
// `{ from: _Array$from }` object literal in place of the `Array` default - the
// generator function body wrapper does not block the swap. yield receives the same
// runtime binding as if it had been written inline
function* g({ from } = Array) {
  yield from([1]);
}
g();
