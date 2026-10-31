// `Object.setPrototypeOf(o, ...)` only rewires `[[Prototype]]`; it can't change types of own properties.
// Own slots always shadow inherited at read time, so the alias narrow on `o.arr` is unaffected.
const o = {
  arr: [1, 2, 3],
  test() {
    Object.setPrototypeOf(o, null);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
