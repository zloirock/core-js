import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
var _ref;
// a SEALED probe nav under a claim the RECEIVER channel erases: `(nav).Map` collapses to the
// ponyfill ctor and the dispatch above reads off it, dropping the read the source performs on the
// sealed value. that read comes back as a throw probe, the same one the claim channel emits for
// every shape that keeps its receiver - the rows below enumerate both families
export const instanceOnCtor = _nameMaybeFunction(((null == _globalThis.window ? void 0 : _self).Map, _Map));
export const instanceOnOtherCtor = _nameMaybeFunction(((null == _globalThis.window ? void 0 : _self).Promise, _Promise));
export const instanceThroughTail = _nameMaybeFunction(((null == _globalThis.window ? void 0 : _self).Map, _Map)).length;
export const instanceDispatch = _at(_ref = _nameMaybeFunction(((null == _globalThis.window ? void 0 : _self).Map, _Map))).call(_ref, 0);

// the consumers that always kept the probe - one per shape family. `prototypeRead` is the one
// that routes through the kept-nav render rather than the erase: a claim sitting BELOW the chain
// end belongs to the erase channel, which swaps it and re-emits the read, where the nav render
// would spell the guard and leave `Map` native - the realm's prototype, not the ponyfill's
export const prototypeRead = ((null == _globalThis.window ? void 0 : _self).Map, _Map).prototype;
export const ctorLength = ((null == _globalThis.window ? void 0 : _self).Map, _Map).length;
export const staticCall = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of)(1);
export const ctorStatic = ((null == _globalThis.window ? void 0 : _self).Number, _Number$MAX_SAFE_INTEGER);
export const viaIntermediate = ((null == _globalThis.window ? void 0 : _self).Map, _Map);

// a seal over a nav that ENDS AT the claim has no hop leaf for the nav plan to render, so the
// guard is built from the erase verdict's own `?.` object with the claim's ponyfill as the
// always-defined alternate - the read the seal makes observable survives either way
export const sealedNavEndingAtClaim = ((null == _globalThis.window ? void 0 : _Promise).resolve, _Promise$resolve);

// a WRITE host is a member access like any other: the seal keeps its read, so the collapse may
// not retarget it at the live realm global (it wrote there and swallowed the throw)
export function writeHost(v) {
  _self.Box = v;
}
export const deleteHost = () => delete _globalThis.Box;

// a leaf core-js ponyfills no constructor for has no binding to stand in as the always-defined
// alternate, so the guard reads off the global's own name - the claim beside it still polyfills
export const unponyfilledCtorLeaf = ((null == _globalThis.window ? void 0 : Array).of, _Array$of)(1);

// an effect the source wrote BEFORE the nav runs before the read the probe reproduces: a sequence
// prefix is not part of the guarded value and may not migrate behind it
export let seq = 0;
export const prefixAheadOfProbe = (seq++, (null == _globalThis.window ? void 0 : _self).Array, _Array$of)(1);