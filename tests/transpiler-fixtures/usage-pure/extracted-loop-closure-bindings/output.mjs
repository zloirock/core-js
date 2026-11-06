import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Both extracted and residual locals retain their per-iteration closure.
export function register(rows, handlers) {
  for (const row of rows) {
    const name = _nameMaybeFunction(row);
    const find = _findMaybeArray(row);
    handlers[name] = () => find();
  }
}