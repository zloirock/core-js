import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {} catch ({
  [_Symbol$iterator]: it = _flatMaybeArray(_ref = [9]).call(_ref),
  ...rest
}) {
  it;
  rest;
}