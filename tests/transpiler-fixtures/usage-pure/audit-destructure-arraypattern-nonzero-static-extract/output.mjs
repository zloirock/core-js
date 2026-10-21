import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const [, {
  from
}] = [_Set, Array];
const arr = from([1, 2, 3]);
_atMaybeArray(arr).call(arr, 0);