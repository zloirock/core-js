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
