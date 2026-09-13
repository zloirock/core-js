// The switch case may initialize the hoisted realm alias before the read outside it.
// Pure guards the live constructor read: the taken case receives the static polyfill,
// while an uninitialized alias keeps its native TypeError.
function f() {
  switch (x) {
    case 1: var M = globalThis;
  }
  M.Array.from([1]);
}
