import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
export function read(unknown) {
  const log = [];
  for (const e of [Array]) {
    const [_ref,,] = [e, unknown];
    const of = (_pushMaybeArray(log).call(log, 'k'), _Array$of);
    const from = _Array$fromAsync;
    const at = _at(unknown);
    const {
      length
    } = unknown;
    use(of, from, at, length);
  }
  return log;
}