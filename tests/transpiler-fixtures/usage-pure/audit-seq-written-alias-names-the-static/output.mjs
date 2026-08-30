import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// the receiver an alias names is the same receiver whatever spelling the source uses for it: an
// alias WRITTEN in the sequence that reads it names the realm exactly as the bare global does, so
// the static above it polyfills instead of reading raw off the host. the guarded read below is the
// other half - the guard test evaluates the receiver, so its writes run there and not a second time
// ahead of it
let alias;
let stored;
export const named = (alias = _globalThis, stored = null == alias.window ? void 0 : _self, _Number$MAX_SAFE_INTEGER);
export const bare = (stored = null == _globalThis.window ? void 0 : _self, _Number$MAX_SAFE_INTEGER);
export const guarded = null == (alias = _globalThis, stored = null == alias.window ? void 0 : _self) ? void 0 : _Promise.noSuchStatic;