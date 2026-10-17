// a computed non-polyfilled inner keeps the bracket read under the same short-circuit
export function nonPolyComputedInner(o, k) {
  return o?.b.c[k]?.().map(x => x).length;
}
