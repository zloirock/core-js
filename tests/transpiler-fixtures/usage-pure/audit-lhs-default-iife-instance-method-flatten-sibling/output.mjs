import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a static extraction sharing a pattern with a key whose default is an IIFE calling an instance
// method: the method's memo is declared inside the IIFE body, which stays in the residual pattern,
// never beside the extracted declaration.
const from = _Array$from;
const {
  x = function () {
    var _ref;
    return _atMaybeArray(_ref = [1]).call(_ref, 0);
  }()
} = Array;
from([1]);