import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref;
// Discarding a known value reader does not expose the class or its prototype methods.
class Box {
  static rows = [8, 9];
  data = 0;
  read() {
    return this.data;
  }
}
_Object$values(Box);
use(_atMaybeArray(_ref = Box.rows).call(_ref, -1));