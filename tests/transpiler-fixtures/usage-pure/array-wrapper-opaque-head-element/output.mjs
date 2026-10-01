import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
// A captured wrapper retains its effectful static key beside an opaque instance leaf.
// Narrowing the constructor cannot shed the capture or duplicate the key evaluation.
export function read(unknown) {
  const log = [];
  for (const e of [Array]) {
    const [_ref, _ref2] = [e, unknown];
    const of = (_pushMaybeArray(log).call(log, 'k'), _Array$of);
    const from = _Array$fromAsync;
    const at = _at(_ref2);
    const {
      length
    } = _ref2;
    use(of, from, at, length);
  }
  return log;
}