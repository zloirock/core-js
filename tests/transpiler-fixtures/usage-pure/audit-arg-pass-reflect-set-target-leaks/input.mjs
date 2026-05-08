// `Reflect.set(o, ...)` 3-arg form mutates the target slot, so the alias narrow on `o.arr` must drop.
// Mirrors `Object.assign` target-leak via the Reflect lookup path.
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.set(o, "x", 1);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
