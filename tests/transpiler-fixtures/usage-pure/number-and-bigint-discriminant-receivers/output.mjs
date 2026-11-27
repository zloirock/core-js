import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// Numeric and BigInt tags select different receiver families.
type Wide = {
  tag: 2;
  items: number[];
} | {
  tag: 2n;
  items: string;
};
declare const wide: Wide;
if (wide.tag === 2) _atMaybeArray(_ref = wide.items).call(_ref, 0);
if (wide.tag === 2n) _includesMaybeString(_ref2 = wide.items).call(_ref2, 'x');