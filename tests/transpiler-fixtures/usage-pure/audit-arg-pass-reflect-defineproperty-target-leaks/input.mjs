// `Reflect.defineProperty(o, key, desc)` mutates target (index 0). Reflect API mirror of
// Object.defineProperty - same `mutatesArgument: [0]` annotation drives the same 'leak'
// classification path
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.defineProperty(o, "x", { value: 1 });
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
