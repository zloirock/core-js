// `Object.assign(o, ...)` mutates the target slot, so the alias narrow on `o.arr` must be abandoned.
// Generic instance polyfills are required because runtime shape may diverge from the property init.
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(o, { x: 1 });
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
