import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let log = [];
const _ref = (() => {
    _pushMaybeArray(log).call(log, 1);
    return Array;
  })(),
  of = null == _ref ? _ref[""] : _Array$of,
  {
    of: _unused,
    ...rest
  } = _ref;
of(2);
export { rest, log };