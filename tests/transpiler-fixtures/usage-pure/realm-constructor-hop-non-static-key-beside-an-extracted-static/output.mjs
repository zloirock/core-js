import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A non-static key read off a constructor hop of the realm beside an extracted static: unplugin mirrors the
// hop and reads the key off the constructor's ponyfill, the one every rewritten read of the constructor uses
// (the sidecar), while babel's residual reads it off the native constructor - its debt.
const user = {};
const g = _Map$groupBy;
const {
  k: {
    Map: {
      0: z
    }
  } = c ? _globalThis : user
} = {
  k: _globalThis
};
export { g, z };