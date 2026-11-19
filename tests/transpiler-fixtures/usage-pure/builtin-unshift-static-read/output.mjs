import _unshiftMaybeArray from "@core-js/pure/actual/array/instance/unshift";
import _Map from "@core-js/pure/actual/map/constructor";
// Passing Map to a builtin does not require its full namespace.
// Pure deliberately leaves the later slot read native: following a value installed
// by a builtin is deferred. The constructor entry alone does not provide groupBy.
const b = [];
_unshiftMaybeArray(b).call(b, _Map);
const result = typeof b[0].groupBy;