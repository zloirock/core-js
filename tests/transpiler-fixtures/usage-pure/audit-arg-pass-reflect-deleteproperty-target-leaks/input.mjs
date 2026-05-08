// `Reflect.deleteProperty(o, ...)` removes an own property, which counts as a target mutation.
// Property removal can drop other tracked narrows, so the alias narrow on `o.arr` must drop too.
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.deleteProperty(o, "x");
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
