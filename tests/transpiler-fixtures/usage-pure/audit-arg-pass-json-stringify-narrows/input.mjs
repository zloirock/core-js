// `JSON.stringify(o)` is a pure read, so the alias-closure narrow on `o.arr` survives.
// The array-narrow polyfill must be picked, not the generic instance fallback.
const o = {
  arr: [1, 2, 3],
  test() {
    JSON.stringify(o);
    return this.arr.at(0);
  }
};
o.test();
