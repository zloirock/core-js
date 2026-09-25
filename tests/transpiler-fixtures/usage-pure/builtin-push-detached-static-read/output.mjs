import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A constructor a builtin inserts through a detached invoker - `.call`, `.apply` - needs no full
// namespace, as with the direct spelling: pure leaves the later slot read native, following a value
// a builtin installed being deferred. one constructor per spelling
const b = [];
_pushMaybeArray(b).call(b, _Map);
const viaCall = typeof b[0].groupBy;
const c = [];
_pushMaybeArray(c).apply(c, [_Promise]);
const viaApply = typeof c[0].try;
export { viaCall, viaApply };