import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3, _ref4;
// a trailing comma the SOURCE wrote rides through untouched: this plugin lowers no syntax, and a
// list already spelled `f(1,)` means the target is not ES5 or a transpiler runs after us. dropping
// it would hold only where the argument text is re-spliced and not where the callee alone is
// swapped - one rule in two spellings. the AST renderer drops it when reprinting; hence the sidecar.
const a = [[1]];
export const instanceDispatch = _flatMaybeArray(a).call(a, 1);
export const twoArgs = _atMaybeArray(a).call(a, 0);
export const commaThenComment = _flatMaybeArray(a).call(a, 1 /* c */);
export const underNavGuard = null == _globalThis.window ? void 0 : _Array$from([1]);
export const combinedSlots = null == (_ref = _flatMaybeArray(a)) ? void 0 : _atMaybeArray(_ref2 = _ref.call(a, 1)).call(_ref2, 0);

// the callee-swap half: the argument bytes are never touched here
export const plainClaim = _Array$from([1]);
export const constructed = new _Map([[1, 2]]);

// a comma the argument itself contains is not the list's own
export const inString = _includesMaybeArray(_ref3 = ["x"]).call(_ref3, "a,");
export const inRegex = _includesMaybeArray(_ref4 = ["x"]).call(_ref4, /a,/.source);

// NEGATIVE: no source comma, so the two emitters agree byte for byte on these
export const plain = _flatMaybeArray(a).call(a, 1);
export const zeroArity = _flatMaybeArray(a).call(a) /* c */;