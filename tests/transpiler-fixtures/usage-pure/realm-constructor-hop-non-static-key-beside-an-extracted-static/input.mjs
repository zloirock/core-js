// A non-static key read off a constructor hop of the realm beside an extracted static: unplugin mirrors the
// hop and reads the key off the constructor's ponyfill, the one every rewritten read of the constructor uses
// (the sidecar), while babel's residual reads it off the native constructor - its debt.
const user = {};
const { k: { Map: { groupBy: g, 0: z } } = c ? globalThis : user } = { k: globalThis };
export { g, z };
