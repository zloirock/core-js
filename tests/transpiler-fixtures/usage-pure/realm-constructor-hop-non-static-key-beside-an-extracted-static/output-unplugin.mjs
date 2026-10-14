// A non-static key read off a constructor hop of the realm beside an extracted static: unplugin mirrors the
// hop and reads the key off the constructor's ponyfill, the one every rewritten read of the constructor uses
// (the sidecar), while babel's residual reads it off the native constructor - its debt.
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";

const user = {};
const { k: { Map: { groupBy: g, 0: z } } = c ? _globalThis : user } = { k: { Map: { groupBy: _Map$groupBy, "0": _Map["0"] } } };

export { g, z };