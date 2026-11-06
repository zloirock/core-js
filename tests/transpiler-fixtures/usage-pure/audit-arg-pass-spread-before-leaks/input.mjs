// A leading spread in `Object.assign(...sources, o)` makes `o`'s runtime index unknown.
// Empty `sources` would shift `o` into the mutating target slot, so the call must conservatively leak.
const sources = [];
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(...sources, o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
