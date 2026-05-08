// User-defined functions are unknown to the mutating-slot allowlist, so they must default to leak.
// `unknownFn` could rebind `o.arr` to any value, hence the alias narrow has to drop.
const o = {
  arr: [1, 2, 3],
  test() {
    unknownFn(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
function unknownFn(p) { p.arr = "stringified"; }
o.test();
