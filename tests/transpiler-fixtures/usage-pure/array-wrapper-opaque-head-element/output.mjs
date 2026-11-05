import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
// An effectful constructor key and an opaque instance leaf share one array capture.
// The static claims are served without repeating the key or losing the native length read.
export function read(unknown) {
  const log = [];
  for (const e of [Array]) {
    const [{},,] = [e, unknown];
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