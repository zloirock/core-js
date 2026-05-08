// `Object.defineProperty(o, ...)` mutates the target slot, so the alias narrow on `o.arr` must drop.
// Confirms the singular-variant entry mirrors the same mutating-slot annotation as `Object.assign`.
const o = {
  arr: [1, 2, 3],
  test() {
    Object.defineProperty(o, "x", { value: 1 });
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
