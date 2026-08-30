import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// TS wrappers across the probe nav: a BARE wrapper (`!`, an unparenthesized cast position)
// erases without breaking the chain - the short-circuit survives and the value canon renders
// the guarded ponyfill; a PARENTHESIZED layer seals - the member above it parses PLAIN and
// the render keeps the source's throw semantics. distinct methods per line
let c = 0;
export const bareNonNullHop = null == _globalThis.window ? void 0 : (c++, _self).Number;
export const bareNonNullMidChain = null == _globalThis.window ? void 0 : _flatMaybeArray(_ref = _Array$of(2)).call(_ref);
export const castSealValueUse = (null == _globalThis.window ? void 0 : _self).Math;
export const parenSealPlainRead = (null == _globalThis.window ? void 0 : _self).JSON;
export const castSealDelete = delete (_globalThis.customProp as any);

// the cast-seal probes ride the CLAIM, DESTRUCTURE and SYNTH channels too (erasure keeps
// the paren seal; the throw probe re-emits the sealed read, the key SE runs on it once)
let c2 = 0;
export const castSealClaim = _atMaybeArray(_ref2 = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of)(6)).call(_ref2, 0);
export const castSealDestructure = ((null == _globalThis.window ? void 0 : _self).Object, _Object$keys);
export function castSealSynth({
  values: sv
} = ((null == _globalThis.window ? void 0 : (c2++, _self)).Object, {
  values: _Object$values
})) {
  return sv;
}
export { c2 };

// the bare-`!` KEPT-ASSIGN spelling stays raw on BOTH legs (the kept canon owns the write; the
// wrapper neither seals nor unlocks a collapse). its VALUE twin has no write to keep, so the
// short-circuit render owns it and the hop resolves to its ponyfill instead of being read raw
let kv;
export const bareNonNullKeptAssign = (kv = null == _globalThis.window ? void 0 : _self)?.BigInt;
export const bareNonNullKeptValue = null == _globalThis.window ? void 0 : _self;
export { c };

// a CAST-sealed SE-key destructure source: the wrapper peels transparently, the residual
// rides the guard exactly like the paren-sealed spelling
let c3 = 0;
export const castSealSeKeyResidual = _Object$freeze;
export const {
  [(c3++, 'freeze')]: _unused
} = (null == _globalThis.window ? void 0 : _self).Object;
export { c3 };