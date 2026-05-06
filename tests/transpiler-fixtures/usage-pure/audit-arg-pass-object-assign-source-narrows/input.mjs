// `Object.assign(target, o)` reads `o` as a source - target is mutated, sources are not.
// `mutatesArgument: [0]` excludes index 1, so `o` at the source slot classifies as 'trivial'
// and narrowing survives. complement of audit-arg-pass-object-assign-target-leaks: same call
// shape, different arg slot, opposite outcome. confirms the per-index granularity of the
// annotation rather than a coarse "any arg of a mutating method bails"
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(target, o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
