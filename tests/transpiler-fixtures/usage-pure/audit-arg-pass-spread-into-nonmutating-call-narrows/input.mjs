// `Math.max(...o)` spreads into a callee with no mutating slots, so the alias narrow on `o.arr` survives.
// Pairs with the value-source spread fixture: same conclusion via the call-with-non-mutating-callee path.
const o = {
  arr: [1, 2, 3],
  test() {
    Math.max(...o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
