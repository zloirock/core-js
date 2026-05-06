import _Object$assign from "@core-js/pure/actual/object/assign";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Object.assign(target, o)` reads `o` as a source - target is mutated, sources are not.
// `mutatesArgument: [0]` excludes index 1, so `o` at the source slot classifies as 'trivial'
// and narrowing survives. complement of audit-arg-pass-object-assign-target-leaks: same call
// shape, different arg slot, opposite outcome. confirms the per-index granularity of the
// annotation rather than a coarse "any arg of a mutating method bails"
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$assign(target, o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();