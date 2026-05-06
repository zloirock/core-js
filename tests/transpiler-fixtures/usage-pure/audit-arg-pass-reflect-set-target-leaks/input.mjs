// `Reflect.set(o, key, value)` mutates target arg (index 0). known-built-in-return-types.json
// flags Reflect.set with `mutatesArgument: [0]`. mirror of object-assign-target-leaks for the
// Reflect API surface - same closure-leak outcome, exercises the Reflect lookup path
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.set(o, "x", 1);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
