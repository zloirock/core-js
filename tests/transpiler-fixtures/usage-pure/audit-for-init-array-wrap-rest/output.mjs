import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
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
for (let i = 0, [,] = [Array], fromAsync = _Array$fromAsync, {
    fromAsync: _unused2,
    ...more
  } = Array; i < 1; i++) {
  fromAsync([i]);
}