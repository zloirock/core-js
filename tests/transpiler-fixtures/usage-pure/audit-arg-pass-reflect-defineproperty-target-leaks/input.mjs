// `Reflect.defineProperty(o, ...)` mutates the target slot, so the alias narrow on `o.arr` must drop.
// The Reflect mirror must carry the same mutating-slot annotation as `Object.defineProperty`.
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.defineProperty(o, "x", { value: 1 });
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
