// Spread `...o` at arg index 2 of `Reflect.set` can land on the mutating receiver slot 3 at runtime.
// Spread widening must reach any annotated index >= position, otherwise this case would falsely narrow.
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.set(target, "x", ...o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
