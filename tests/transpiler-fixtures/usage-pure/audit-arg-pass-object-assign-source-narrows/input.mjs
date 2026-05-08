// `Object.assign(target, o)` mutates only the target slot, so `o` as a source preserves the alias narrow.
// Verifies per-index granularity: a mutating callee doesn't bail every arg, only the annotated ones.
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(target, o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
