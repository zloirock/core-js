import _Map from "@core-js/pure/actual/map/constructor";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Passing Map to a builtin does not require its full namespace.
// Pure deliberately leaves the later slot read native: following a value installed
// by a builtin is deferred. The constructor entry alone does not provide groupBy.
const w = {
  k: Object
};
_Object$assign(w, {
  k: _Map
});
const result = typeof w.k.groupBy;