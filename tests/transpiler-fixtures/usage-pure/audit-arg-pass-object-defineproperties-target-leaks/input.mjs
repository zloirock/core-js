// `Object.defineProperties(o, descMap)` redefines multiple properties at once on the target
// (index 0). mutates argument 0; classifier returns 'leak'. confirms the
// `mutatesArgument: [0]` annotation also applies to the plural variant
const o = {
  arr: [1, 2, 3],
  test() {
    Object.defineProperties(o, { x: { value: 1 } });
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
