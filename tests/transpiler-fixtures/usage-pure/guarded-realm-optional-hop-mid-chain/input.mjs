// A `?.` on the NEXT step reads the guard's own value, so the narrow stays at member level.
export function midChain(flag) {
  if (flag) { var realm = globalThis; }
  return realm?.Map?.groupBy;
}
