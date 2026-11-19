// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
(function f({ from, ...r1 } = Array, { keys, ...r2 } = Object, { resolve, ...r3 } = Promise) {
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
})();
