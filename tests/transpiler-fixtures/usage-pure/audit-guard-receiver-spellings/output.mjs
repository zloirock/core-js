import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
// the guard's kept receiver reaches the channel in three spellings, and the collapse verdict must be
// the same in all of them: an ALIAS binding, a DESTRUCTURED extraction, and a TS-wrapped expression.
// what decides it is the hop, not the spelling - a hop core-js ponyfills collapses and the guard goes
// with it, one it does not keeps both the raw read and the guard, and an unresolvable hop in the
// MIDDLE renders the shared plan. a reassigned alias stays raw whatever it currently holds.
// one static per row, so a row that changes verdict shows up in the import set.

// --- alias spellings ---
const aliasWindow = _globalThis.window;
let k1;
export const aliasOfUnponyfilled = null == (k1 = aliasWindow) ? void 0 : _Map$groupBy([1, 2], v => v % 2);
const aliasSelf = _self;
let k2;
export const aliasOfPonyfilled = (k2 = aliasSelf, _Object$entries)({
  a: 1
});
const aliasRoot = _globalThis;
let k3;
export const aliasRootThenHop = (k3 = _self, _Math$hypot)(3, 4);
const aliasFactory = () => _self;
let k4;
export const aliasThroughCall = (k4 = aliasFactory(), _Reflect$ownKeys)({
  b: 2
});
let reassigned = _globalThis.window;
reassigned = _self;
let k5;
export const aliasReassigned = null == (k5 = reassigned) ? void 0 : _Number$parseFloat('1.5');
const aliasNested = _self;
let k6;
export const aliasOfMidHopNav = (k6 = aliasNested, _Array$of)(5);

// --- destructured spellings ---
const extracted = _self;
export const destructuredHop = _Array$from([1, 2]);
const {
  window: extractedWindow
} = _globalThis;
export const destructuredUnponyfilled = _Object$values({
  c: 3
});
const {
  window: extractedNested
} = _globalThis;
export const destructuredNested = null == extractedNested ? void 0 : _Object$fromEntries([['d', 4]]);
const fromArray = _self;
export const destructuredThroughArray = _Promise$resolve(1);
const withDefault = _self === void 0 ? _globalThis : _self;
export const destructuredWithDefault = _Promise$allSettled([]);

// --- TS-wrapped spellings ---
let k7;
export const castInsideAssign = (k7 = _self, _Math$trunc)(6.7);
let k8;
export const castAroundValue = (k8 = _self, _Number$parseInt)('7', 10);
let k9;
// the static stays raw here BY CONSTRUCTION, not by a miss: `Object.keys` only needs the
// polyfill for a PRIMITIVE argument, and an object literal is filtered out of the injection.
// what this row spells is the receiver: a non-null assertion over an unponyfillable hop
export const nonNullOnUnponyfilled = (k9 = _globalThis.window!)?.Object.keys({
  e: 5
});
let k10;
export const satisfiesOnPlainHop = (k10 = _self, _Object$assign)({}, {
  f: 6
});

// a WRAPPER around a MULTI-HOP nav inside the chain-assign: the head the guard re-emits is the
// target and the operator, nothing between them. slicing it up to the VALUE swallowed the wrapper's
// opening token while its closer went with the replaced span, and the module stopped parsing
let k13;
export const wrappedMultiHopNav = null == (k13 = null == _globalThis.window ? void 0 : _self) ? void 0 : _Object$getOwnPropertyNames({});
let k14;
export const wrappedResolvableNav = null == (k14 = _self.window) ? void 0 : _Promise$reject(1).catch(() => {});
let k15;
export const doubleWrappedNav = (k15 = _self)?.Object.getPrototypeOf({});
let k11;
export const castAroundAssign = (k11 = _self, _Math$sign)(-2);
let k12;
export const nonNullOnResult = (k12 = _self, _String$fromCodePoint)(99);