import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// 5-deep chain on a 3-deep array: element-tracking runs out at level 4, whose receiver is a
// number, so that level matches no variant and stays raw. level 5 then reads its receiver off
// that unresolved call and has no type at all, which is what selects the type-agnostic entry -
// the emitted name is the proof: an array receiver would have taken the array-specific helper
// and a bottomed-out primitive would have taken nothing.
// chain-depth coverage: same method per level is intentional, drives chain-walker reach
const arr = [[[1]], [[2]]];
null == (_ref = _atMaybeArray(arr).call(arr, 0)) ? void 0 : _at(_ref2 = _atMaybeArray(_ref3 = _atMaybeArray(_ref).call(_ref, 0)).call(_ref3, 0).at(0)).call(_ref2, 0);