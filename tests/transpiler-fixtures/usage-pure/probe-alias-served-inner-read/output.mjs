import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A held window probe is still read before its Promise.resolve claim.
// Serving the inner static must preserve the source failure when that probe is absent.
const held = _globalThis.window;
export const value = typeof (held.Promise, _Promise$resolve);