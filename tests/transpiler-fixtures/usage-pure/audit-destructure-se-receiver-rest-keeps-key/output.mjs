import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let log = [];
const from = (_pushMaybeArray(log).call(log, 1), _Array$from),
  {
    from: _unused,
    ...rest
  } = Array;
from([1]);
export { rest, log };