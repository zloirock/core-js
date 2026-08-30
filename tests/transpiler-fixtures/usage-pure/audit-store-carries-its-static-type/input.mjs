// a chain-ASSIGN hands the stored value on, exactly as a sequence hands its tail on - so a static
// read through it has the type it has without the store. the proxy-global walk of the TYPE channel
// read the store as opaque, the static's own type went unknown, and the instance claim above it fell
// to the generic dispatch: `.name` on a NUMBER was routed through `function/instance/name` and pulled
// that module in for nothing. the store-free twins below are what the stored spelling has to match
let out, v;
const bare = Number.MAX_SAFE_INTEGER.name;
const navigated = globalThis.self.Number.MAX_SAFE_INTEGER.name;
const stored = (v = globalThis.self).Number.MAX_SAFE_INTEGER.name;
const storedProbe = (v = globalThis.window?.self).Number?.MAX_SAFE_INTEGER.name;
// the receiver whose type the store carries the OTHER way: an array stays an array through it, so
// the dispatch keeps its specialised helper instead of the generic one
const arr = [1];
const storedArray = (v = globalThis.self).Array.prototype.at.call(arr, 0);
out = [bare, navigated, stored, storedProbe, storedArray];
export const read = out;
