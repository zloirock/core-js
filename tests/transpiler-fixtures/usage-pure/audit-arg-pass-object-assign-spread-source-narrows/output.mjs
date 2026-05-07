import _Object$assign from "@core-js/pure/actual/object/assign";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
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
    var _ref, _ref2;
    _Object$assign(target, ...o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();