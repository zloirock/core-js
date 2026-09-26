import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an instance dispatch reached through a `.call` read over a probe-holding root keeps the root's
// guard on both legs and reads the prototype off the folded ponyfill; the instance claim below the
// chain end owns the nav, so its split composes the root probe into its own test on both legs
// (`x == null`), and the hop-claim guard never spells it first
const probeAlias = _globalThis.window;
export const probeInstance = probeAlias == null ? void 0 : _atMaybeArray(_self.Array.prototype).call([7], 0);