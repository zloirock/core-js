import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
abstract class Container {
  abstract fields: string[];
  abstract accessor label: string;
  abstract values(): number[];
}
export function readSlots(value: Container) {
  var _ref, _ref2, _ref3;
  return [_atMaybeArray(_ref = value.fields).call(_ref, 0), _atMaybeString(_ref2 = value.label).call(_ref2, 0), _includesMaybeArray(_ref3 = value.values()).call(_ref3, 1)];
}