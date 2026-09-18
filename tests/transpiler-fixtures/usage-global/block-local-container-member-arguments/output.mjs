import "core-js/modules/es.array.push";
// An array receives repeated member values from a block-local opaque source.
// Resolving that source must leave the array's written slots before following its keys.
// Keep the push polyfill and the later member read, including its native throw.
export function f(g) {
  const C = [];
  {
    const a = g();
    C.push(a.b, a.b);
  }
  return C.x.y;
}