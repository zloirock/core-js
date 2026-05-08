// `Object.keys(o)` is a pure read, so the alias narrow on `o.arr` survives across the call.
// Both `.at` and `.includes` must pick the array-narrow polyfill, not the generic instance fallback.
const o = {
  arr: [1, 2, 3],
  test() {
    Object.keys(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
