import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
// For-init captures serve statics beside rest while preserving each rest exclusion.
// The static-only wrapper with a neighbouring element keeps its native from read.
for (const [,] = [Array], of = _Array$of, {
    of: _unused,
    ...r
  } = Array;;) {
  of(1);
  break;
}
for (const [{
  from
}, extra] = [Array, 1];;) {
  from([2, extra]);
  break;
}
// a multi-declarator header takes the sibling polyfill mid-list
for (let i = 0, [,] = [Array], fromAsync = _Array$fromAsync, {
    fromAsync: _unused2,
    ...more
  } = Array; i < 1; i++) {
  fromAsync([i]);
}