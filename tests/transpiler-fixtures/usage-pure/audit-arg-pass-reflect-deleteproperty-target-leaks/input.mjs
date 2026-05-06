// `Reflect.deleteProperty(o, key)` removes own property from target (index 0). delete is a
// mutation just like add - the property may have held a value that other narrows depended
// on. flagged with `mutatesArgument: [0]`; classifier returns 'leak'
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.deleteProperty(o, "x");
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
