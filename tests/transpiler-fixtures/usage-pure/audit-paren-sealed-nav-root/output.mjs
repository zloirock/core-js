import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref7, _ref8, _ref9;
// a PAREN-SEALED undefinable nav as a chain root: the seal ends the inner chain, so the outer
// `?.` guards the sealed VALUE - which CAN be undefined (the live inner `?.` tests an
// unresolvable window read). the claim renders GUARDED with the canonical nested test; eating
// the guard ran the branch where native short-circuits (a wrong value off-browser)
export const viaSealedOptTail = null == (_ref = null == _globalThis.window ? void 0 : _self.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(3)).call(_ref2, 0);

// the same shape as a parameter default renders identically
export function viaParamDefault(x = null == (_ref3 = null == _globalThis.window ? void 0 : _self.window) ? void 0 : _toFixedMaybeNumber(_ref4 = _Number$MAX_SAFE_INTEGER).call(_ref4, 2)) {
  return x;
}

// the UNSEALED spelling shares one source of undefined - the window hop - and the same
// nested test guards it
export const viaUnsealedChain = null == _globalThis.window ? void 0 : _Map;

// NEGATIVE: a PLAIN value-use of the sealed nav collapses to the root - the internal `?.`
// short-circuits only the sealed value, the plain read observes it (throw semantics), and the
// non-claimable leaf keeps the locked navigation-drop canon
export const viaPlainValueUse = (null == _globalThis.window ? void 0 : _self.window).Array;

// the sealed root serves every OPTIONAL claim spelling like the alias of the same value:
// the METHOD-call claim folds into the guard, the CALL tail rides the branch (the guard-paren
// seam differs cosmetically between emitters), the DESTRUCTURE extraction receives the
// guarded value, and the bare CTOR read claims like the unsealed litErased canon
export const viaSealedMethodCall = (null == _globalThis.window ? void 0 : _Array$of)?.(3);
export const viaSealedCallTail = null == _globalThis.window ? void 0 : _Promise$resolve(4)?.then?.(x => x);
export const viaSealedDestructure = _atMaybeArray(null == _globalThis.window ? void 0 : _Array$of(9));
export const viaSealedCtorRead = null == _globalThis.window ? void 0 : _Map;

// PLAIN claims through the sealed root claim receiverless, but the erase re-emits the read
// the source performs on the sealed VALUE as a THROW probe ahead of the claim: an absent
// `window` throws at the probe exactly as the source does, a present one reads through the
// ponyfill and drops the value - call, destructure and the claimable ctor value-use alike
export const viaSealedPlainCall = _atMaybeArray(_ref5 = ((null == _globalThis.window ? void 0 : _self.window).Array, _Array$of)(6)).call(_ref5, 0);
export const viaSealedPlainDestructure = _atMaybeArray(((null == _globalThis.window ? void 0 : _self.window).Array, _Array$of)(7));
export const viaSealedPlainCtorRead = ((null == _globalThis.window ? void 0 : _self.window).Promise, _Promise);

// the throw probe rides the OTHER sealed erase channels too: the prototype-placement swap
// (only the CTOR sub-receiver swaps, `.prototype` survives) and the static-FALLBACK swap
// (the member itself is not polyfilled; an SE hop key rides the probe exactly once)
export const viaSealedProtoMethod = ((null == _globalThis.window ? void 0 : _self.window).Map, _Map).prototype.has.call(new _Map(), 5);
let c2 = 0;
export const viaSealedFallbackStatic = ((null == _globalThis.window ? void 0 : (c2++, _self)).Promise, _Promise).noSuchStatic;
export { c2 };

// the probe rides DESTRUCTURE and INSTANCE spellings of the sealed source too: a static
// prop claim carries it in the extracted binding (throw before ANY binding lands), an
// instance receiver renders the guarded nav INSIDE the helper argument
export const viaSealedDestructure2 = _includesMaybeArray((null == _globalThis.window ? void 0 : _self.window).Array.prototype);
let c3 = 0;
export const viaSealedSeKeyDestructure = ((null == _globalThis.window ? void 0 : (c3++, _self)).Object, _Object$entries);
export const viaSealedInstanceCall = _findIndexMaybeArray((null == _globalThis.window ? void 0 : _self.window).Array.prototype).call([8], v => v === 8);
export { c3 };

// the probe rides the PARAM-DEFAULT synth swap too: the sealed read re-emits ahead of the
// synth literal (throw before the default binds; the nav's key SE runs once, on the probe)
export function viaSealedSynthDefault({
  getPrototypeOf: sp1
} = ((null == _globalThis.window ? void 0 : _self.window).Object, {
  getPrototypeOf: _Object$getPrototypeOf
})) {
  return sp1;
}
let c4 = 0;
export function viaSealedSeKeySynthDefault({
  setPrototypeOf: sp2
} = (null == _globalThis.window ? void 0 : (c4++, _self)).Object) {
  return sp2;
}
export { c4 };

// synth NEGATIVES: an unresolvable prop sibling bails the whole synth (the raw default IS
// the destructure source - its read carries the throw); an empty pattern keeps the
// guard-value render of the source (nothing extracts, the read still probes)
export function viaSealedSynthResidualBail({
  groupBy: sn1,
  customK: sn2
} = ((null == _globalThis.window ? void 0 : _self.window).Object, {
  groupBy: _Object$groupBy,
  customK: (null == _globalThis.window ? void 0 : _self.window).Object.customK
})) {
  return [sn1, sn2];
}
export const {} = (null == _globalThis.window ? void 0 : _self.window).Math;

// the probe rides the fallback-LOGICAL and per-branch TERNARY synth spellings through the
// branch the value reads through (the left / the taken branch); a probe-carried key SE
// leaves the rescue channel exactly once
let c5 = 0;
export function viaSealedLogicalSynth({
  fromEntries: sl1
} = ((null == _globalThis.window ? void 0 : (c5++, _self)).Object, {
  fromEntries: _Object$fromEntries
})) {
  return sl1;
}
let cond1 = true;
export function viaSealedBranchSynth({
  assign: sb1
} = cond1 ? ((null == _globalThis.window ? void 0 : _self.window).Object, {
  assign: _Object$assign
}) : {
  assign: _Object$assign
}) {
  return sb1;
}
export { c5 };

// probe-carrying synth reaches the remaining HOSTS through their own visitors: a for-init
// extracted binding and a class-field IIFE param default (SE-key rides the probe once)
let c6 = 0;
for (const fh1 = ((null == _globalThis.window ? void 0 : _self.window).Object, _Object$getOwnPropertySymbols); c6 < 1; c6++) void fh1;
class SealedHost {
  field = (({
    is: fv
  } = ((null == _globalThis.window ? void 0 : (c6++, _self)).Object, {
    is: _Object$is
  })) => fv)();
}
export const sealedHost = new SealedHost();
export { c6 };

// probed NEGATIVES locked verbatim: an SE-key sealed receiver with an unresolvable prop
// sibling bails the synth WHOLE (a hybrid would run the key SE twice); a fallback-LOGICAL
// with a non-collapsible right keeps the raw branch pair; a MUTATED `self` slot deopts the
// probe render (the read must observe the user's replacement, raw)
let c7 = 0;
export function viaSealedSeKeyResidualBail({
  getOwnPropertyNames: nb1,
  customK: nb2
} = function (_ref6) {
  return {
    getOwnPropertyNames: _Object$getOwnPropertyNames,
    customK: _ref6.customK
  };
}((null == _globalThis.window ? void 0 : (c7++, _self)).Object)) {
  return [nb1, nb2];
}
export function viaSealedLogicalRawBail({
  seal: nb3
} = ((null == _globalThis.window ? void 0 : _self.window).Object, {
  seal: _Object$seal
})) {
  return nb3;
}
export const [] = (null == _globalThis.window ? void 0 : _self.window).Array;
export { c7 };

// ARRAY-pattern and const-alias computed-key destructures ride the probe like the named
// forms; an SE-key residual re-reads the source itself (throw + key SE both live there)
let c8 = 0;
export const [viaSealedArrayPattern] = ((null == _globalThis.window ? void 0 : _self.window).Array, _Array$of)(12);
const aliasKey = 'getOwnPropertyDescriptor';
export const viaSealedAliasKey = ((null == _globalThis.window ? void 0 : _self.window).Object, _Object$getOwnPropertyDescriptor);
export const viaSealedSeKeyResidual = _Object$defineProperty;
export const {
  [(c8++, 'defineProperty')]: _unused
} = (null == _globalThis.window ? void 0 : _self.window).Object;
export { c8 };

// dead `?.` chains over VALUE-DEFINED navs erase whole: the sealed ALL-PLAIN nav (declared
// env) and the hop-order spelling (dead optionals over pony-backed reads, deeper window
// reads are realm self-references)
export const viaSealedAllPlain = _atMaybeArray(_ref7 = _Array$of(8)).call(_ref7, 0);
export const viaHopOrderDead = _atMaybeArray(_ref8 = _Array$of(10)).call(_ref8, 0);

// SE-key residual variants: a LIVE `?.` probe rides the guard with an optionalized tail
// (short-circuit preserved), a claimable CTOR leaf keeps the plain read above the seal
// (the residual claims nothing), a DEFINED hop nav keeps its plain collapse (no guard)
let c9 = 0;
export const viaProbeSeKeyResidual = _Object$getOwnPropertyNames;
export const {
  [(c9++, 'getOwnPropertyNames')]: _unused2
} = null == _globalThis.window ? void 0 : _self.Object;
export const viaSealedCtorLeafResidual = _Array$from;
export const {
  [(c9++, 'from')]: _unused3
} = (null == _globalThis.window ? void 0 : _self).Array;
export const {
  [(c9++, 'isArray')]: viaDefinedHopSeKeyResidual
} = _globalThis.Array;
export { c9 };

// ASSIGNMENT-host SE-key destructures keep the whole pattern in place (no declaration to
// split) - the kept init rides the same guard canon as the declarator residual
let ca = 0;
let viaSealedAssignSeKey;
({
  [(ca++, 'entries')]: viaSealedAssignSeKey = _Object$entries
} = (null == _globalThis.window ? void 0 : _self).Object);
let viaProbeAssignSeKey;
({
  [(ca++, 'keys')]: viaProbeAssignSeKey = _Object$keys
} = null == _globalThis.window ? void 0 : _self.Object);
export { viaSealedAssignSeKey, viaProbeAssignSeKey, ca };

// ALIAS-rooted probe navs ride the same canon with the alias identifier kept verbatim in
// the guard test; a DEFINED alias nav keeps the hop-drop / ctor-swap collapses
const gAlias = _globalThis;
let cb = 0;
export const viaAliasKeptSealed = (null == gAlias.window ? void 0 : _self).Object;
export const viaAliasKeptLive = null == gAlias.window ? void 0 : _self.Object;
export const viaAliasSealedClaim = ((null == gAlias.window ? void 0 : _self).Array, _Array$of)(3);
export const viaAliasSealedSeKey = _Object$values;
export const {
  [(cb++, 'values')]: _unused4
} = (null == gAlias.window ? void 0 : _self).Object;
export const viaAliasDefinedHopDrop = gAlias.Object;
export const viaAliasDefinedCtorSwap = (cb++, _Map);
export { cb };

// an SE computed KEY combined with an SE CALL root in ONE sealed probe: the guard test owns
// the single call run, the alternate owns the single key run (native order test-key-read)
let cc1 = 0,
  kc1 = 0;
const dheCombo = () => {
  cc1++;
  return _globalThis;
};
export const viaSeKeySeCallRoot = _atMaybeArray(_ref9 = ((null == dheCombo().window ? void 0 : (kc1++, _self)).Array, _Array$of)(5)).call(_ref9, 0);
export { cc1, kc1 };