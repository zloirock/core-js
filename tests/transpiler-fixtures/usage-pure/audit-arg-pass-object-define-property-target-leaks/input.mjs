// `Object.defineProperty(o, key, desc)` adds / redefines a property on the target (index 0).
// mutates argument 0; classifier returns 'leak' for `o` at that slot. narrowing on `arr` is
// abandoned. covers the Object.defineProperty entry that ships `mutatesArgument: [0]`
const o = {
  arr: [1, 2, 3],
  test() {
    Object.defineProperty(o, "x", { value: 1 });
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
