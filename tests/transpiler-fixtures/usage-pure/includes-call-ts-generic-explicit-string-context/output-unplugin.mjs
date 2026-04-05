var _ref, _ref2;
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface Box<T> {
  items: T[];
}
const b: Box<string> = {} as any;
_includesMaybeString(_ref = _atMaybeArray(_ref2 = b.items).call(_ref2, -1)).call(_ref, 'x');