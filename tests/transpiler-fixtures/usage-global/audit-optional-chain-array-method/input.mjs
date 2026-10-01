// global-mode optional-chain coverage parity with usage-pure. `arr?.flat()` polyfill
// emits ES module side-effect import for es.array.flat without breaking the optional
// receiver semantics
function pick(maybeArr) {
  return maybeArr?.flat();
}
console.log(pick([[1, 2], [3]]));
