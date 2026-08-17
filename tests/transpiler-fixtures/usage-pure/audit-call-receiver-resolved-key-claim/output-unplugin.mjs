import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$EPSILON from "@core-js/pure/actual/number/epsilon";
import _self from "@core-js/pure/actual/self";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15;
// a CALL receiver under a computed key that RESOLVES to a method name while carrying an effect: the
// dispatch spells the whole span itself - receiver memoized behind the guard, key effect migrated
// out - so the global channel's claim over the nav inside it has nothing left to compose into. a
// guard already queued over a root INSIDE the claim's span is what says the nav was consumed
// NOTE on the entry set this file records: the setup below WRITES a globalThis slot, which puts the
// whole file into the mutated-static deopt. after it no nav receiver is provably the native one, so
// every `at` here resolves to the full family set rather than a narrowed one - `Array.of(1).at(0)`
// included, which narrows on its own in a file without such a write. the subject here is claim
// OWNERSHIP, not narrowing; the narrowing signal lives on literal receivers, which the deopt
// does not touch
_globalThis.claimBox = { list: ['ab', 'cd'], get: function () { return ['ef']; } };
let k = 0;
export const callReceiverResolvedKey = null == (_ref = _globalThis.window) ? void 0 : (_ref2 = _ref.claimBox.get(), k++, _at(_ref2).call(_ref2, 0));
export const callReceiverStaticKey = null == (_ref3 = _globalThis.window) ? void 0 : _at(_ref4 = _ref3.claimBox.get()).call(_ref4, 0);
export const memberReceiverResolvedKey = null == (_ref5 = _globalThis.window) ? void 0 : (_ref6 = _ref5.claimBox.list, k++, _at(_ref6).call(_ref6, 0));

// the same claim WITHOUT an enclosing guard keeps its own emission - the negative that pins the
// consumed-nav condition rather than the mere presence of a claim
export const unguardedCallReceiver = (_ref7 = _globalThis.claimBox.get(), k++, _at(_ref7).call(_ref7, 0));
export { k };

// STRONG negatives: a guard does sit over a root inside each claim's span, yet every claim below is
// still owed - the nav feeding it was never consumed into a memo. dropping any of these would lose
// a polyfill silently, which is the only way the ownership gate can go wrong
export const staticClaimUnderGuard = null == (_ref8 = _globalThis.window) ? void 0 : _atMaybeArray(_ref9 = _Array$of(1)).call(_ref9, 0);
export const bareStaticClaim = null == _globalThis.window ? void 0 : _self.Array;
export const twoClaimsOneStatement = [null == _globalThis.window ? void 0 : _Array$of(1), null == _globalThis.window ? void 0 : _self.Object.keys({})];
export const claimInsideArgument = null == _globalThis.window ? void 0 : _Array$of(null == _globalThis.window ? void 0 : _Math$trunc(1.5));
// the seal ends the chain before the claim's own key, so the source reads `.of` off a value that
// can be undefined - the erase re-emits exactly that read ahead of the claim. the alternate is the
// global's own name where core-js ponyfills no constructor for it
export const parenthesizedClaim = ((null == _globalThis.window ? void 0 : Array).of, _Array$of)(1);
export const claimThenInstance = null == (_ref10 = _globalThis.window) ? void 0 : _atMaybeArray(_ref11 = _Array$from('ab')).call(_ref11, 0);
export const claimsAcrossOperator = (null == _globalThis.window ? void 0 : _Math$trunc(1.5)) + (null == _globalThis.window ? void 0 : _Number$EPSILON);

// a nav nested in an ARGUMENT keeps its OWN test, and the rows below walk what sits between the two
// reads of the root: nothing, a call, an assignment. no spelling may lift the inner test over the
// call the source wrote - that turns the argument's short-circuit into the whole call's, and where
// the probe is absent the source still evaluates the call with an undefined argument
let hops = 0;
function bump() {
  hops += 1;
  return 0;
}
export const callBetweenRootReads = null == _globalThis.window ? void 0 : _Array$of(bump(), null == _globalThis.window ? void 0 : _Math$trunc(1.5));
export const assignBetweenRootReads = null == _globalThis.window ? void 0 : _Array$of((hops = 1), null == _globalThis.window ? void 0 : _Math$trunc(2.5));
export { hops };

// a plain property read in the same slot: its getter is user code, so it can reach the root between
// the two reads exactly as a call can
const hopBox = { n: 4 };
export const readBetweenRootReads = null == _globalThis.window ? void 0 : _Array$of(hopBox.n, null == _globalThis.window ? void 0 : _Math$trunc(3.5));

// the outer chain's own CALL runs in full between the two reads, and its argument can reach the root
// through an iterator or an accessor - another shape whose inner test has to stay put
const seed = [7, 8];
export const spineCallBeforeKey = null == _globalThis.window ? void 0 : _Array$from(seed)[null == _globalThis.window ? void 0 : _Math$trunc(0.5)];
export const spineCallBeforeArg = null == (_ref12 = _globalThis.window) ? void 0 : _atMaybeArray(_ref13 = _ref12.Object.keys({ a: 1 })).call(_ref13, null == _globalThis.window ? void 0 : _self.Math.round(0.4));
// a SPREAD argument is evaluated where the spread sits and the expansion follows it
export const spreadArgument = null == _globalThis.window ? void 0 : _Array$of(...[null == _globalThis.window ? void 0 : _Math$trunc(1.5)]);

// the guard channel lifts a nested nav's node into a ternary alternate WITHOUT a path replace, so
// the chain walk above it answers from an emptied slot. it has to end there instead of replacing
// through it - the second row keeps nothing polyfilled on the outer tail, which is a different
// resolver route to the same nesting
export const nestedNavPlainTail = null == _globalThis.window ? void 0 : _self.Object.keys({ b: 2 }).pop(null == _globalThis.window ? void 0 : _self.Math.round(0.4));
export const nestedNavOpaqueStatic = null == (_ref14 = _globalThis.window) ? void 0 : _atMaybeString(_ref15 = _JSON$stringify({ c: 3 })).call(_ref15, null == _globalThis.window ? void 0 : _self.Math.round(0.4));