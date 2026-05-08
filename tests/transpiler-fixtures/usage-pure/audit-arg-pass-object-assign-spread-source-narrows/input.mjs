// Spread `...o` at arg index 1 of `Object.assign` cannot reach the mutating slot 0 at runtime.
// Spread widening must be forward-only, otherwise every spread call would falsely leak.
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(target, ...o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
