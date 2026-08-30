import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
var _ref, _ref2;
// what the receiver-guard channel keeps in the KEPT chain-assign value, by hop kind: a navigation
// that IS the value collapses to its last ponyfillable hop, one whose last hop has no pure entry
// keeps the root and reads that hop off it, and one whose UNRESOLVABLE hop sits in the middle
// renders the shared guard plan instead of collapsing through it. the claim behind the guard does
// not change that answer - the three claim shapes below cross it. one static and one instance
// method per line, so a row that stops resolving shows up in the import set too.
let selfPlain, selfPlainB, selfPlainC;
export const lastHopStatic = (selfPlain = _self, _Map$groupBy)([1, 2], v => v % 2);
export const lastHopValue = (selfPlainB = _self, _Object$entries)({
  a: 1
});
export const lastHopCallTail = _atMaybeArray(_ref = (selfPlainC = _self, _Array$from)([1])).call(_ref, 0);
let unponyfilled, unponyfilledB, unponyfilledC;
export const rootOnlyStatic = null == (unponyfilled = _globalThis.window) ? void 0 : _Math$hypot(3, 4);
export const rootOnlyValue = null == (unponyfilledB = _globalThis.window) ? void 0 : _Number$parseFloat('1.5');
export const rootOnlyCallTail = null == (unponyfilledC = _globalThis.window) ? void 0 : _endsWithMaybeString(_ref2 = _String$fromCodePoint(99)).call(_ref2, 'c');
let midHop, midHopB;
export const guardedPlanStatic = null == (midHop = null == _globalThis.window ? void 0 : _self) ? void 0 : _Reflect$ownKeys({
  b: 2
});
export const guardedPlanValue = null == (midHopB = null == _globalThis.window ? void 0 : _self) ? void 0 : _Promise$resolve(1);
let nested;
export const nestedNav = null == (nested = _self.window) ? void 0 : _JSON$stringify({
  c: 3
});