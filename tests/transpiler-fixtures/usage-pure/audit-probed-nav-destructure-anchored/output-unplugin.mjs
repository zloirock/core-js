import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$parse from "@core-js/pure/actual/json/parse";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _Object$values from "@core-js/pure/actual/object/values";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _structuredClone from "@core-js/pure/actual/structured-clone";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings (which would erase the throw and
// run computed-key effects the source never reaches)

// SE-computed-key leaf under a static-ctor pattern hop: extraction + guarded residual (the
// key effect and the throw both live in the residual read)
let f1 = 0;
export const viaAnchoredSealedSeKey = _Object$freeze;
export const { [(f1++, 'freeze')]: _unused } = (null == _globalThis.window ? void 0 : _self).Object;
export { f1 };

// unresolvable custom leaf under a resolvable ctor hop: the residual re-anchors onto the
// guarded member read, not the always-defined ctor binding
export const { customY: viaAnchoredSealedCustom } = (null == _globalThis.window ? void 0 : _self).Map;

// member-read anchor (no whole-ctor pure entry) over a LIVE probe
export const { floor: viaAnchoredLiveFloor } = (null == _globalThis.window ? void 0 : _self).Math;

// FULL consume: the extraction carries the guarded anchor read as a throw probe, once per
// pattern (native throws before any prop read)
export const viaAnchoredSealedFull = ((null == _globalThis.window ? void 0 : _self).JSON, _JSON$stringify);

// DEFINED navs keep the plain anchored collapses - no guard, no probe
export const viaDefinedAnchoredTrunc = _Math$trunc;
export const viaDefinedAnchoredOwnKeys = _Reflect$ownKeys;

// for-init hosts ride the same guard renders (member-read anchor in the for-head, SE-key
// leaf via the trailing sink declarator)
let f2 = 0;
for (const { floor: viaForInitAnchor } = (null == _globalThis.window ? void 0 : _self).Math; f2 < 1; f2++) { void viaForInitAnchor; }
let f3 = 0;
for (const { [(f3++, 'keys')]: _unused2 } = (null == _globalThis.window ? void 0 : _self).Object, viaForInitSeKey = _Object$keys; f3 < 2;) { void viaForInitSeKey; break; }
export { f2, f3 };

// a slot-MUTATED anchor ctor keeps the RAW member read through the guard (the user's
// replacement stays visible at a present probe; the throw survives at an absent one)
_globalThis.Map = function PatchedMap() {};
export const { customY: viaMutatedAnchor } = (null == _globalThis.window ? void 0 : _self).Map;

// a REST sibling declines the single-prop anchor: the flat residual keeps the guard-value
// init (an always-defined receiver binding would erase the probe's throw AND hand rest the
// realm global); a flat PARTIAL consume off a probed member nav rides the same guard
export const viaRestDeclinedAnchor = _Math$trunc;
export const { Math: _unused3, ...viaRestRest } = null == _globalThis.window ? void 0 : _self;
export const viaPartialProbed = _Number$isInteger;
export const { customZ: viaPartialCustom } = null == _globalThis.window ? void 0 : _self.Number;

// FULL consumes outside the anchor gate carry the same once-per-pattern probe: multi-prop
// nested, single-level flat (the probe read is the pattern key itself), array-wrapped
// (the probe value is the descended element), and the assignment-host cascade
export const viaMultiPropA = ((null == _globalThis.window ? void 0 : _self).Math, _Math$cbrt);
export const viaMultiPropB = _Object$seal;
export const viaFlatBareNav = ((null == _globalThis.window ? void 0 : _self).structuredClone, _structuredClone);
export const viaArrayWrapped = ((null == _globalThis.window ? void 0 : _self).Math, _Math$hypot);
let viaAssignFull;
viaAssignFull = ((null == _globalThis.window ? void 0 : _self).Math, _Math$sign);
export { viaAssignFull };

// CALL-rooted probe navs: the guard test owns the single root-call run (a PURE proven call
// stays verbatim in the test; an SE call must not be replayed by the discard harvest; an
// identity-IIFE root substitutes its buried global)
const dhPure = () => _globalThis;
export const viaCallRootPure = ((null == dhPure().window ? void 0 : _self).Math, _Math$expm1);
let callRootEff = 0;
const dhSe = () => { callRootEff++; return _globalThis; };
export const viaCallRootSe = ((null == dhSe().window ? void 0 : _self).JSON, _JSON$parse);
export const viaCallRootIife = ((null == (x => x)(_globalThis).window ? void 0 : _self).Object, _Object$values);
export { callRootEff };

// CTOR-LEAF probe navs: the init's VALUE decides the probe, not its leaf NAME - a constructor
// leaf discards through the same full-consume gate, and the probe reads the first key off the
// two-halves guard (the erase verdict's `?.` object as the test, the ctor ponyfill alternate)
export const viaCtorLeaf = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
export const viaCtorLeafRenamed = ((null == _globalThis.window ? void 0 : Array).from, _Array$from);
export const viaCtorLeafDeep = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
let viaCtorLeafCascade;
viaCtorLeafCascade = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
export { viaCtorLeafCascade };
export const viaCtorLeafWrapped = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
const heldCtorNav = _globalThis.window;
export const viaCtorLeafAlias = ((null == heldCtorNav ? void 0 : Array).of, _Array$of);
export const viaCtorLeafSealed = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const { a: { of: viaCtorLeafLiteral } } = { a: _globalThis.window?.Array };

// the probe key is POSITION-INDEPENDENT: both property orders reproduce the source's throw,
// and a string-literal / computed `[Symbol.iterator]` first key probes like the dotted one
export const { union: viaAnchoredFirstA } = ((null == _globalThis.window ? void 0 : _self).Set, _Set);
export const viaAnchoredFirstB = _Array$of;
export const viaConsumedFirstA = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const { union: viaConsumedFirstB } = _Set;
export const viaStringKeyFirst = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const { union: viaStringKeySibling } = _Set;
export const viaSymbolFirst = ((null == _globalThis.window ? void 0 : _self)[_Symbol$iterator], _getIteratorMethod(_self));
export const viaSymbolSibling = _Array$of;
export const viaSymbolOnly = _getIteratorMethod(null == _globalThis.window ? void 0 : _self.Array.prototype);

// a `||` / `??` FALLBACK rescues the nullish path: a reachable diverging fallback keeps the
// source native, an agreeing ctor fallback keeps the per-branch machinery, and a SEALED left
// THROWS instead of selecting - its dead fallback drops while the probe stays
export const { of: viaFallbackObject } = _globalThis.window?.Array ?? {};
export const { of: viaFallbackOr } = _globalThis.window?.Array || {};
export const { of: viaFallbackAgree } = _globalThis.window?.Array ?? { of: _Array$of };
export const viaFallbackSealed = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const { self: { Array: { of: viaFallbackNested } } } = _globalThis.window ?? {};

// NEGATIVES: resolvable roots/hops keep the collapse, a PARTIAL consume keeps its residual
export const viaDefinedRoot = _Array$of;
export const viaResolvableHop = _Array$of;
export const viaAllPlainNav = _Array$of;
export const viaPartialConsume = _Array$of;
export const { of: _unused4, ...viaPartialRest } = _globalThis.window?.Array;

// the value that IS the environment probe: a bare one-hop init (`= globalThis.window`), its
// sealed twin, an agreeing-proxy ternary collapse and an alias HOLDING the probe all consume
// a value that is absent exactly off-env - the probe reads the first key off the guard whose
// test operand doubles as the alternate. resolvable roots keep their collapse, and the deep
// unresolvable hop keeps the accepted realm-self-reference collapse
export const viaBareProbe = ((null == _globalThis.window ? void 0 : _globalThis.window).Array, _Array$of);
export const viaBareProbeSealed = ((null == _globalThis.window ? void 0 : _globalThis.window).Array, _Array$of);
export const viaBareProbeFlat = ((null == _globalThis.window ? void 0 : _globalThis.window).structuredClone, _structuredClone);
export const viaBareProbeTernary = ((null == _globalThis.window ? void 0 : _globalThis.window).Array, _Array$of);
const heldProbe = _globalThis.window;
export const viaBareProbeAlias = ((null == heldProbe ? void 0 : heldProbe).Array, _Array$of);
export const viaDefinedGlobal = _Array$of;
export const viaDefinedSelf = _Array$of;
export const viaDeepSelfRef = _Array$of;