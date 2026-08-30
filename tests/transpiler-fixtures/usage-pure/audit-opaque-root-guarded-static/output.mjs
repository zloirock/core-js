import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref29, _ref30, _ref31, _ref32, _ref36, _ref37;
// a static reached through an OPAQUE inline-call proxy-nav root under an OUTER instance
// dispatch: the guard memoizes the raw root once (its SE + short-circuit), and the guarded
// branch collapses the static onto the ponyfill - call and FIELD spellings alike, in BOTH
// emitters. a provably pure inline root carries the provenance through the memo
const f = () => _globalThis;
export const viaGuardedStaticCall = null == f()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(5)).call(_ref, 0);
const g = () => _globalThis;
export const viaGuardedStaticField = null == g()?.window ? void 0 : _toFixedMaybeNumber(_ref2 = _Number$MAX_SAFE_INTEGER).call(_ref2, 2);

// NEGATIVE: a non-proxy call root keeps the whole chain native off the ref
const h = () => ({
  window: {
    Array: {
      of: x => [x, 'custom']
    }
  }
});
export const nonProxyStaysRaw = null == (_ref3 = h()?.window) ? void 0 : _at(_ref4 = _ref3.Array.of(8)).call(_ref4, 0);

// an SE-carrying sequence at the chain root: the memo assignment runs the effect exactly once
// in the guard test, so the branch reads the ponyfill leaf
let seCount = 0;
const eff = () => seCount++;
const k = () => _globalThis;
export const seRootKeepsRef = null == (eff(), k())?.window ? void 0 : _atMaybeArray(_ref5 = _Array$of(6)).call(_ref5, 0);

// a COMPUTED trailing key with an SE evaluates after the collapsed static, in source order
let keyCount = 0;
const keySe = () => keyCount++;
const m = () => _globalThis;
export const viaComputedTrailing = null == m()?.window ? void 0 : (_ref6 = _Array$from([3]), keySe(), _atMaybeArray(_ref6).call(_ref6, 0));

// optional spellings on the TRAILING dispatch keep their own guards over the collapsed static;
// a NON-polyfillable trailing member rides inside the guarded branch
const p = () => _globalThis;
export const viaOptionalTrailing = null == p().window ? void 0 : _Promise$resolve(4)?.then?.(x => x);

// a CHAIN-ASSIGN root: the assignment rides the guard memo, the static still collapses
let held;
const ca = () => _globalThis;
export const viaChainAssignRoot = null == (held = ca())?.window ? void 0 : _atMaybeArray(_ref7 = _Array$of(7)).call(_ref7, 0);

// an SE argument of the collapsed static call evaluates inside the guarded branch, in place
let argCount = 0;
const argSe = () => argCount++;
const sa = () => _globalThis;
export const viaSeArgument = null == sa()?.window ? void 0 : _atMaybeArray(_ref8 = _Array$of(argSe())).call(_ref8, 0);

// a DESTRUCTURE over the guarded static extracts through the instance canon: the helper
// receives the GUARDED value and throws on the short-circuited void 0 exactly like native
// destructuring of undefined (faithful-throw)
const dg = () => _globalThis;
const pickedAt = _atMaybeArray(null == dg().window ? void 0 : _Array$of(9));
export const viaDestructureOverGuarded = pickedAt;

// DEEP pristine hops over the provably pure call root: BOTH emitters drop the call and read
// the hops off the ponyfill leaf - a raw `.self` read would miss every engine
// the web.self ponyfill serves (the polyfill invariant), so the guard itself is ponyfill-backed
const dh = () => _globalThis;
export const viaDeepHops = null == _self ? void 0 : _atMaybeArray(_ref9 = _Array$of(3)).call(_ref9, 0);

// an SE-carrying inline BODY of the call root replays as a sequence prefix on the collapsed
// guard test (`(db(), _self).window`) - the effect runs exactly once, the branch reads the
// ponyfill leaf
let bodyCount = 0;
const db = () => {
  bodyCount++;
  return _globalThis;
};
export const viaSeBodyRoot = null == (db(), _self) ? void 0 : _atMaybeArray(_ref10 = _Array$of(11)).call(_ref10, 0);

// hops SWAPPED (the unresolvable window hop before the ponyfillable self hop): both optional
// objects share the window hop as their only source of undefined, so ONE nested test on the
// window prefix guards the chain and the branch still reads the ponyfill leaf
const dw = () => _globalThis;
export const viaHopOrderSwap = null == dw()?.window ? void 0 : _atMaybeArray(_ref11 = _Array$of(12)).call(_ref11, 0);

// an OPTIONAL call root of a proven const-bound callee guards like the plain call - the
// callee cannot be undefined, so the call adds no source of undefined
const oc = () => _globalThis;
export const viaOptionalCallRoot = null == oc?.()?.window ? void 0 : _atMaybeArray(_ref12 = _Array$of(13)).call(_ref12, 0);

// a SECOND unresolvable hop past the ponyfillable one stays raw on the guarded ref (two
// sources of undefined: the nested test covers the window prefix, the outer memo test the
// chrome value). the static reads off the opaque chrome value, not a global - no collapse.
// the unplanned `chrome` tail rides inside the guarded branch
const upu = () => _globalThis;
export const viaUnresPonyUnres = null == (_ref13 = null == upu().window ? void 0 : _self.chrome) ? void 0 : _at(_ref14 = _ref13.Array.of(14)).call(_ref14, 0);

// a CHAIN-ASSIGN wrapper around the proven call root rides the nested test verbatim - the
// write runs exactly once, the branch reads the ponyfill leaf
let heldRoot;
const ca2 = () => _globalThis;
export const viaChainAssignSwap = null == (heldRoot = ca2())?.window ? void 0 : _atMaybeArray(_ref15 = _Array$of(15)).call(_ref15, 0);

// a CONST-bound computed hop key resolves like the dotted spelling - the nested test guards
// the window prefix and the branch reads the ponyfill leaf
const ck = () => _globalThis;
const hopKey = 'self';
export const viaComputedMidHop = null == ck()?.window ? void 0 : _at(_ref16 = _Array$of(16)).call(_ref16, 0);

// NEGATIVE: a MAYBE-undefined callee (conditional assignment) is not provable - the chain
// keeps the raw guarded read off the ref
let mf;
if (_globalThis.setTimeout) mf = () => _globalThis;
export const viaMaybeUndefinedFn = null == mf?.()?.window ? void 0 : _atMaybeArray(_ref17 = _Array$of(17)).call(_ref17, 0);

// a CHAIN-ASSIGN root with an SE-carrying provable body folds BOTH effects (the write and the
// body) into the sequence prefix, exactly once, and the branch reads the ponyfill leaf
let heldSe,
  seBodyCount = 0;
const cse = () => {
  seBodyCount++;
  return _globalThis;
};
export const viaChainAssignSeBody = null == (heldSe = cse(), _self) ? void 0 : _atMaybeArray(_ref18 = _Array$of(18)).call(_ref18, 0);

// an SE-PREFIXED computed hop key still RESOLVES for the guard count (the effect stays live in
// the kept test text, in source order after the window test) - the branch reads the ponyfill
// leaf
let keyEff = 0;
const sk = () => _globalThis;
export const viaSeComputedOwnKey = null == (null == sk().window ? void 0 : (keyEff++, _self)) ? void 0 : _atMaybeArray(_ref19 = _Array$of(19)).call(_ref19, 0);

// a TEMPLATE-literal hop key resolves like the dotted spelling through the canonical key fold
const tk = () => _globalThis;
export const viaTemplateKey = null == tk()?.window ? void 0 : _atMaybeArray(_ref20 = _Array$of(20)).call(_ref20, 0);

// a NESTED provable wrapper (`f` returns `g()` which returns the global) proves through the
// same inline canon, layer by layer
const ng = () => _globalThis;
const nf = () => ng();
export const viaNestedCallRoot = null == nf()?.window ? void 0 : _atMaybeArray(_ref21 = _Array$of(21)).call(_ref21, 0);

// a PLAIN (non-optional) ponyfillable tail hop collapses with the branch - only the optional
// window hop is a source of undefined
const pt = () => _globalThis;
export const viaPlainTailStatic = null == pt()?.window ? void 0 : _atMaybeArray(_ref22 = _Array$of(22)).call(_ref22, 0);

// a DESTRUCTURE over the swapped-hop chain: the guard tests the SHORTEST object carrying the
// unresolvable hop (the window prefix), never a raw ponyfillable hop read; the helper receives
// the guarded value and keeps the native throw on the short-circuit path
const dsw = () => _globalThis;
const pickedSwapAt = _atMaybeArray(null == dsw().window ? void 0 : _Array$of(23));
export const viaDestructureOverSwap = pickedSwapAt;

// an IDENTITY-IIFE root (`((x) => x)(globalThis)`) proves through the identity-param inline
// canon: the buried global substitutes, the live window test guards the chain, the branch
// reads the ponyfill leaf (only the arrow reprint differs between emitters)
export const viaIdentityRoot = null == (x => x)(_globalThis)?.window ? void 0 : _atMaybeArray(_ref23 = _Array$of(24)).call(_ref23, 0);

// an SE-carrying ARG of the identity root rides the kept test, exactly once, in source order
let idEff = 0;
export const viaIdentitySeArg = null == (x => x)((idEff++, _globalThis))?.window ? void 0 : _atMaybeArray(_ref24 = _Array$of(25)).call(_ref24, 0);

// the plain (no-optional-chain) identity spelling folds the receiver into a sequence with the
// collapsed static - the arg effect and the buried-global substitution both survive
let seqEff = 0;
export const viaIdentitySeqStatic = ((x => x)((seqEff++, _globalThis)), _Array$of)(26);

// NEGATIVE: mutually-recursive wrappers never prove (the cycle guard stops the inline walk) -
// the chain keeps the raw guarded read off the ref
const cyc1 = () => cyc2();
const cyc2 = () => cyc1();
export const viaCyclicAliasKeepsRef = null == (_ref25 = cyc1()?.window?.self) ? void 0 : _at(_ref26 = _ref25.Array.of(27)).call(_ref26, 0);

// NEGATIVE: a binding SHADOWING the global name (a parameter) keeps the raw identifier - the
// buried-global proof and the substitution both respect scope
function shadowWrap(globalThis) {
  var _ref27, _ref28;
  return null == (_ref27 = (x => x)(globalThis)?.window?.self) ? void 0 : _at(_ref28 = _ref27.Array.of(28)).call(_ref28, 0);
}
export const viaShadowedGlobal = shadowWrap;

// a VALUE-OBSERVING carrier (`??`) between the guarded chain and the static keeps the read on
// the carrier RESULT (the fallback object may own the key) - no collapse past the carrier; the
// root SE runs once inside the kept test
const nc = () => _globalThis;
export const viaNullishCarrier = _at(_ref29 = ((null == nc().window ? void 0 : _self) ?? {
  Array
}).Array.of(29)).call(_ref29, 0);

// a LOGICAL retest spells each leg through the same nested canon - the left leg keeps its own
// guarded read, the right leg guards the dispatch
const lg = () => _globalThis;
export const viaLogicalRetest = (null == lg().window ? void 0 : _self) && (null == lg()?.window ? void 0 : _atMaybeArray(_ref30 = _Array$of(30)).call(_ref30, 0));

// a CTOR read through the guarded identity chain: the guard tests the window prefix, both
// legs construct the ponyfill (`new _Map`) - the arrow-paren reprint differs cosmetically
export const viaIdentityCtorNew = (null == (x => x)(_globalThis).window ? void 0 : _Map) && new _Map([[1, 2]]).size;

// an ALIAS holding an undefinable nav: the write stores the value canon (the guard
// conditional), the read classifies through its defined branch, keeps its `?.` LIVE (the
// runtime VALUE is the nav's, not the always-defined global the prefix walk sees) and the
// claim composes PLAIN into the single outer test
let navAlias;
navAlias = null == _globalThis.window ? void 0 : _self;
export const viaAliasNavRead = navAlias == null ? void 0 : _atMaybeArray(_ref31 = _Array$of(31)).call(_ref31, 0);

// an ALIAS of the provable callee follows transitively (identifier hops re-anchor at their
// own declaration scope), so the aliased call proves like the direct one
const mkRoot = () => _globalThis;
const aliasedMk = mkRoot;
export const viaCalleeAlias = null == aliasedMk()?.window ? void 0 : _atMaybeArray(_ref32 = _Array$of(32)).call(_ref32, 0);

// NEGATIVE: an alias of a PARAM-bound callee is an arbitrary caller value - the chain keeps
// the raw guarded read
export function viaCalleeParamAlias(mkRoot) {
  var _ref33, _ref34;
  const inner = mkRoot;
  return null == (_ref33 = inner()?.window?.self) ? void 0 : _at(_ref34 = _ref33.Array.of(33)).call(_ref34, 0);
}

// the callee alias still proves under a same-name param SHADOW of the source binding - the
// alias holds the module-level arrow, the shadow never feeds it
export function viaCalleeAliasShadowed(mkRoot) {
  var _ref35;
  return null == aliasedMk()?.window ? void 0 : _atMaybeArray(_ref35 = _Array$of(34)).call(_ref35, 0);
}

// NEGATIVE: the callee alias captured the SOURCE before its reassignment - the reassigned
// source bails and the chain keeps the raw guarded read (the capture holds whatever the
// program put there)
let swapMk = () => ({
  window: null
});
const heldMk = swapMk;
swapMk = () => _globalThis;
export const viaReassignedSourceCallee = null == (_ref36 = heldMk()?.window?.self) ? void 0 : _at(_ref37 = _ref36.Array.of(35)).call(_ref37, 0);