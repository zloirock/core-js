import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a MUTATED ctor (`globalThis.Map = Shim` in-file) must read off the PATCHED native binding, not the pure
// import - the user's replacement wins. the multi-ctor anchor bails the mutated ctor (mirrors the single-ctor
// anchorSlotMutated bail), so the pattern stays on the native residual; the poly sibling still extracts
_globalThis.Map = function () {};
const {
  Array: {
    from
  },
  Map: {
    customY
  }
} = {
  Array: {
    from: _Array$from
  },
  Map: _globalThis.Map
};
export const out = [from, customY];