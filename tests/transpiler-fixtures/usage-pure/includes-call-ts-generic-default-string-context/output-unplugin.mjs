var _ref, _ref1;
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface Box<T = string> {
  items: T[];
}
const b: Box = {} as any;
_includesMaybeString(_ref = _atMaybeArray(_ref1 = b.items).call(_ref1, -1)).call(_ref, 'x');