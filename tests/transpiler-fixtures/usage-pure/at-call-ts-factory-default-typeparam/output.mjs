import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref2, _ref3;
type Box<T> = {
  v: T[];
};
function makeBox<T = string>(): Box<T> {
  return {
    v: []
  };
}
function run() {
  var _ref;
  _atMaybeArray(_ref = makeBox().v).call(_ref, 0);
}

// The scalar slot exposes the default and an explicit override independently.
declare function makeValue<T = string>(): {
  v: T;
};
_atMaybeString(_ref2 = makeValue().v).call(_ref2, 0);
_atMaybeArray(_ref3 = makeValue<number[]>().v).call(_ref3, 0);