import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Pure-mode control for the opaque member-argument recursion seen in usage-global.
// An array receives repeated member values from a block-local opaque source.
// Resolving that source must leave the array's written slots before following its keys.
// Keep the push polyfill and the later member read, including its native throw.
export function f(g) {
  const C = [];
  {
    const a = g();
    _pushMaybeArray(C).call(C, a.b, a.b);
  }
  return C.x.y;
}