// an optional CALL inside the receiver short-circuits the same way
export function callMid(a) {
  return a?.get?.().rows.flat?.().filter?.(Boolean).length;
}
