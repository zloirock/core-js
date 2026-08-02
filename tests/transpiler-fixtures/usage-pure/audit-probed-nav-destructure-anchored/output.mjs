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
import _structuredClone from "@core-js/pure/actual/structured-clone";
// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings (which would erase the throw and
// run computed-key effects the source never reaches)

// SE-computed-key leaf under a static-ctor pattern hop: extraction + guarded residual (the
// key effect and the throw both live in the residual read)
let f1 = 0;
export const viaAnchoredSealedSeKey = _Object$freeze;
export const {
  [(f1++, 'freeze')]: _unused
} = (null == _globalThis.window ? void 0 : _self).Object;
export { f1 };

// unresolvable custom leaf under a resolvable ctor hop: the residual re-anchors onto the
// guarded member read, not the always-defined ctor binding
export const {
  customY: viaAnchoredSealedCustom
} = (null == _globalThis.window ? void 0 : _self).Map;

// member-read anchor (no whole-ctor pure entry) over a LIVE probe
export const {
  floor: viaAnchoredLiveFloor
} = (null == _globalThis.window ? void 0 : _self).Math;

// FULL consume: the extraction carries the guarded anchor read as a throw probe, once per
// pattern (native throws before any prop read)
export const viaAnchoredSealedFull = ((null == _globalThis.window ? void 0 : _self).JSON, _JSON$stringify); // DEFINED navs keep the plain anchored collapses - no guard, no probe
export const viaDefinedAnchoredTrunc = _Math$trunc;
export const viaDefinedAnchoredOwnKeys = _Reflect$ownKeys; // for-init hosts ride the same guard renders (member-read anchor in the for-head, SE-key
// leaf via the trailing sink declarator)
let f2 = 0;
for (const {
  floor: viaForInitAnchor
} = (null == _globalThis.window ? void 0 : _self).Math; f2 < 1; f2++) {
  void viaForInitAnchor;
}
let f3 = 0;
for (const {
    [(f3++, 'keys')]: _unused2
  } = (null == _globalThis.window ? void 0 : _self).Object, viaForInitSeKey = _Object$keys; f3 < 2;) {
  void viaForInitSeKey;
  break;
}
export { f2, f3 };

// a slot-MUTATED anchor ctor keeps the RAW member read through the guard (the user's
// replacement stays visible at a present probe; the throw survives at an absent one)
_globalThis.Map = function PatchedMap() {};
export const {
  customY: viaMutatedAnchor
} = (null == _globalThis.window ? void 0 : _self).Map;

// a REST sibling declines the single-prop anchor: the flat residual keeps the guard-value
// init (an always-defined receiver binding would erase the probe's throw AND hand rest the
// realm global); a flat PARTIAL consume off a probed member nav rides the same guard
export const viaRestDeclinedAnchor = _Math$trunc;
export const {
  Math: _unused3,
  ...viaRestRest
} = null == _globalThis.window ? void 0 : _self;
export const viaPartialProbed = _Number$isInteger;
export const {
  customZ: viaPartialCustom
} = null == _globalThis.window ? void 0 : _self.Number;

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
const dhSe = () => {
  callRootEff++;
  return _globalThis;
};
export const viaCallRootSe = ((null == dhSe().window ? void 0 : _self).JSON, _JSON$parse);
export const viaCallRootIife = ((null == (x => x)(_globalThis).window ? void 0 : _self).Object, _Object$values);
export { callRootEff };