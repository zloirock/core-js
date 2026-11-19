// `Object.assign(...o)` puts the spread at index 0, where the mutating slot lives.
// Spread expansion must intersect the per-slot mutation profile, so the alias narrow on `o.arr` drops.
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(...o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
