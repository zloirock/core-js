import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// a chain-ASSIGN hands the stored value on, exactly as a sequence hands its tail on - so a static
// read through it has the type it has without the store. the proxy-global walk of the TYPE channel
// read the store as opaque, the static's own type went unknown, and the instance claim above it fell
// to the generic dispatch: `.name` on a NUMBER was routed through `function/instance/name` and pulled
// that module in for nothing. the store-free twins below are what the stored spelling has to match
let out, v;
const bare = _Number$MAX_SAFE_INTEGER.name;
const navigated = _Number$MAX_SAFE_INTEGER.name;
const stored = (v = _self, _Number$MAX_SAFE_INTEGER).name;
const storedProbe = (v = null == _globalThis.window ? void 0 : _self, _Number$MAX_SAFE_INTEGER).name;
// the receiver whose type the store carries the OTHER way: an array stays an array through it, so
// the dispatch keeps its specialised helper instead of the generic one
const arr = [1];
const storedArray = _atMaybeArray((v = _self).Array.prototype).call(arr, 0);
out = [bare, navigated, stored, storedProbe, storedArray];
export const read = out;