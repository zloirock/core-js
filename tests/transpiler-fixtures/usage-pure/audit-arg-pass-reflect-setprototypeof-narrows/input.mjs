// `Reflect.setPrototypeOf(o, ...)` only rewires `[[Prototype]]`, leaving own properties intact.
// The alias narrow on `o.arr` must persist; Reflect mirror behaves like the Object companion.
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.setPrototypeOf(o, null);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
