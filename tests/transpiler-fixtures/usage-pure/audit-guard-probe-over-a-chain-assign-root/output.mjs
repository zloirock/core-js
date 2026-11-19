import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref, _ref2, _ref3, _ref4;
// a chain-assignment root keeps its write and the unbacked `window` probe inside the guard test:
// guarding only the assigned realm value would run the branch where the source short-circuits. the
// test is the same with or without a memoized receiver, and a root whose every hop resolves keeps no
// guard at all - the write is the whole kept prefix and the leaf reads off the ponyfill.
let held, heldDeep, heldPlainHop, heldStatic, heldResolvable;
export const chainAssignInstance = null == (held = _globalThis)?.window ? void 0 : _atMaybeArray(_ref = _Array$of(5)).call(_ref, 0);
export const chainAssignInstanceTwoHops = null == (heldDeep = _globalThis)?.window ? void 0 : _includesMaybeArray(_ref2 = _Array$from([6])).call(_ref2, 6);
export const chainAssignPlainHop = null == (heldPlainHop = _globalThis).window ? void 0 : _flatMaybeArray(_ref3 = _Object$values({
  v: 7
})).call(_ref3);
export const chainAssignStatic = null == (heldStatic = _globalThis).window ? void 0 : _Object$fromEntries([['s', 8]]);
export const chainAssignResolvableHops = _findLastMaybeArray(_ref4 = (heldResolvable = _globalThis, _Object$entries)({
  r: 9
})).call(_ref4, r => r);
export { held, heldDeep, heldPlainHop, heldStatic, heldResolvable };