// an assignment-form alias read in a LOOP BODY resolves the single unconditional write before the
// loop: the back-edge re-runs the read, never the write. a write INSIDE the loop can reach the next
// iteration's read, and a conditional write proves nothing - both keep the read native in the pure
// flavor. one global per row keeps every row's own module in the import set
export function whileBody() {
  let w;
  w = globalThis;
  while (w) {
    return w.Array.of(1);
  }
}
export function nestedLoops() {
  let x;
  x = globalThis;
  for (let i = 0; i < 2; i++) {
    while (i) {
      i--;
      return x.Object.fromEntries([]);
    }
  }
}
export function writeInsideLoop(c, other) {
  let y = globalThis;
  while (c()) {
    y.Map.groupBy([1], v => v);
    y = other;
  }
}
export function conditionalWrite(c) {
  let z;
  if (c()) z = globalThis;
  while (z) {
    return z.Promise.allSettled([]);
  }
}
