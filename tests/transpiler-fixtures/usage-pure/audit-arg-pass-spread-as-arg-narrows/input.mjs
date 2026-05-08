// `{...o}` and similar spread sites read `o` and produce a shallow copy; no aliasing happens.
// Spread used as a value-source must stay non-mutating, otherwise every spread site would falsely leak.
const o = {
  arr: [1, 2, 3],
  test() {
    const copy = { ...o };
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b, copy];
  }
};
o.test();
