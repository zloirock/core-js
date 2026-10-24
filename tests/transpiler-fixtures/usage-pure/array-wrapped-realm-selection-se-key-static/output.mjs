import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A common array capture exposes the static leaves behind each realm selection.
// Computed-key effects keep their order; the captured receiver is not mirrored again.
const [,] = [_globalThis];
const {
  Array: {}
} = _globalThis;
const a = (_pushMaybeArray(log).call(log, 'k'), _Array$of);
const b = _Array$from;
const [_ref] = [_globalThis.window ? _globalThis.window : _globalThis],
  {
    Array: {}
  } = _ref,
  c = (_pushMaybeArray(log).call(log, 'k'), _Array$of),
  d = _Array$from;
use(a, b, c, d);