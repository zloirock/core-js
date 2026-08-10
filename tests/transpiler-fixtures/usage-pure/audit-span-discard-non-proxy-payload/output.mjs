import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref;
// an emit that COLLAPSES a receiver replaces source it does not reproduce, so a polyfillable read
// buried in the discarded region has to stand down with it - left queued it composes against text
// that is gone and the build aborts. every discarded-region shape below (effect-free sequence
// prefix, computed-key prefix, sealed probe receiver, dropped IIFE argument) crosses a claim
// channel: static call, symbol key, prototype-navigated instance, destructure, `in`.
function dh(x) {
  return _globalThis;
}
function eff() {
  return 0;
}
export const staticCall = _Array$of(1);
export const staticRead = _Number$MAX_SAFE_INTEGER;
export const symbolKey = _getIteratorMethod([1, 2]);
export const sealedProbe = _getIteratorMethod(_globalThis);
export const instanceChain = _includesMaybeArray(_globalThis.Array.prototype).call([1], 1);
export const {
  noSuchStatic
} = _globalThis.Number;
export const objectPayload = _Array$of(2);
// a fully-consumed destructure drops its init WHOLE, and the sequence prefix sits under the member
// spine where the top-level peel never reaches it
export const consumedInit = (() => {
  const of = _Array$of;
  return typeof of;
})();
export const arrowPayload = _Array$of(3);
// a PROVEN call root collapses like any other receiver, so its argument is discarded too
export const provenCallArg = _Array$of(5);
// the receiver an emit RE-EMITS keeps its own rewrites: a harvested effect rides ahead of the
// binding, so the read inside it still resolves
export const effectPrefix = (eff(), _Array$of)(4);
export const foldedIn = true;
// negative: an OPAQUE call root proves nothing about its return value, so the static is not claimed
// and the navigation stays exactly as written - only the argument, which survives, is rewritten
export const opaqueRoot = dh(_Promise).self.Array.of(6);

// the sequence prefix ahead of a claimed static is re-emitted VERBATIM, so what it reads keeps its
// own rewrite: a bare proxy global there must still come back polyfilled, not raw. every operand
// shape the prefix can take - a global read, a proxy navigation, a pure discard, a real effect.
// these four rows also record an OPEN divergence rather than an agreed shape: the other emitter
// ELIDES an effect-free prefix instead of re-emitting it, which is why its import set here is
// smaller. what the rows assert is the rewrite INSIDE the prefix, not the decision to keep it
export const prefixGlobal = _nameMaybeFunction(_Map);
export const prefixNav = _nameMaybeFunction(_Map);
export const prefixDiscard = _nameMaybeFunction(_Map);
export const prefixEffect = (_ref = (eff(), _Map), _nameMaybeFunction(_ref));