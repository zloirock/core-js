import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const _ref = (sideEffect(), _self.Array),
  from = _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
from([1, 2, 3]);
rest;