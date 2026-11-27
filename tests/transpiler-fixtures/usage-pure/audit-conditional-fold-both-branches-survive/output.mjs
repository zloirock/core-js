import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref2;
// Both open branches carry arrays, even though their element types differ.
type Wrap<T> = T extends string ? {
  items: number[];
} : {
  items: string[];
};
export function read<T>(value: Wrap<T>) {
  var _ref;
  return _atMaybeArray(_ref = value.items).call(_ref, 0);
}
declare const fixed: Wrap<number>;
_flatMaybeArray(_ref2 = fixed.items).call(_ref2);