import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// A static extracted beside rest keeps its known call-result type.
const _ref = Array,
  make = _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
use(_atMaybeArray(_ref2 = make([1, 2])).call(_ref2, -1), rest);