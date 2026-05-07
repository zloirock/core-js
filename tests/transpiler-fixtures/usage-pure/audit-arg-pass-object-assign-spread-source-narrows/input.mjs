// `Object.assign(target, ...o)` - SpreadElement at AST index 1; mutatesArgument [0]
// covers only the target slot. spread expands to positions 1, 2, 3..., none of which
// reach index 0, so the SpreadElement branch's "any annotated index >= AST position"
// check returns false -> classifier preserves 'trivial' and narrowing survives.
// complement of audit-arg-pass-spread-into-mutating-call-leaks: same callee, spread at
// non-zero index, opposite outcome. confirms that spread expansion only widens forward
// (to indices >= position), not backward
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
