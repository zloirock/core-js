import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
// the receiver of an instance dispatch is memoized RAW, so the redundant proxy hops above the
// guard's root survive as native `self` reads - the very class their ponyfill serves. once the
// guard has memoized the root the tail hangs off a ref carrying that root's provenance, and the
// shared receiver plan recognises it: the hops drop there. hops ONLY - a plan resolving a pure
// root would inject an import this channel never decided on. the runtime cannot see the
// difference (every host pairs `self` with `window`, and off-window the chain short-circuits
// before the read), so the emitted text is the lock
export const plainInstanceArm = null == (_ref = _globalThis.window) ? void 0 : _flatMaybeArray(_ref2 = _ref.box).call(_ref2, 1);
export const deepNavInstanceArm = null == (_ref3 = _globalThis.window) ? void 0 : _flatMaybeArray(_ref4 = _ref3.box).call(_ref4, 2);

// the chain-COMBINE arm always rebuilt its tail from clones and dropped the hops - it is the
// shape the arm above now agrees with
export const chainCombineArm = null == (_ref5 = _globalThis.window) ? void 0 : _at(_ref6 = _flatMaybeArray(_ref7 = _ref5.box).call(_ref7)).call(_ref6, 0);

// a live `?.` over a DEEP hop is not a probe either - only the FIRST hop off the root reads the
// host environment, and the guard channel cannot tell the two apart because the discriminator
// sits ABOVE it: a seal makes every short-circuit below observable. unsealed and deep, the chain
// belongs to the same collapse
export const deepHopNoProbe = _globalThis.Array;
export const deepHopDispatch = _flatMaybeArray(_ref8 = _globalThis.box).call(_ref8, 3);

// POSITIVE control: the FIRST hop off the root IS the probe, and its guard stays
export const firstHopProbe = null == _globalThis.window ? void 0 : _self.Array;

// POSITIVE control: a SEAL over the same deep chain makes the short-circuit observable again
export const sealedDeepHop = _globalThis.Array;

// NEGATIVE: with no live `?.` the whole navigation collapses to the root, hops and all
export const noOptionalHop = _flatMaybeArray(_ref9 = _globalThis.box).call(_ref9, 1);