export function writeInsideLoop(c, other) {
  let y = globalThis;
  while (c()) {
    y.Map.groupBy([1], v => v);
    y = other;
  }
}
