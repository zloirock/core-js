import _Object$assign from "@core-js/pure/actual/object/assign";
// `Object.assign(Builtin, { static })` monkey-patches the static slot, so a later read of that
// static must keep the global (not the pure import) or it desyncs from the patched implementation
_Object$assign(Array, {
  from() {
    return [];
  }
});
export const r = Array.from([1, 2]);