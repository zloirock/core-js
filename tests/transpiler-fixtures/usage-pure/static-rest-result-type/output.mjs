import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A static extracted beside rest keeps its known call-result type.
const make = _Array$from,
  {
    from: _unused,
    ...rest
  } = Array;
use(_atMaybeArray(_ref = make([1, 2])).call(_ref, -1), rest);