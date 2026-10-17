// `Object.freeze(o)` locks future writes but doesn't change existing property types.
// Property-type narrowing must persist; freeze/seal/preventExtensions all stay non-mutating for tracking.
const o = {
  arr: [1, 2, 3],
  test() {
    Object.freeze(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
