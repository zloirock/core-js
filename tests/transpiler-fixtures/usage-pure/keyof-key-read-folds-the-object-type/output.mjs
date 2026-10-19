import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `obj[k]` where `k: keyof X` and X is the object's type reads `X[keyof X]`: through the binding's own
// `typeof` for a literal it holds, through an annotation for a typed parameter
const LABELS = {
  ok: 'fine',
  bad: 'broken'
} as const;
export function label(key: keyof typeof LABELS) {
  var _ref;
  return _atMaybeString(_ref = LABELS[key]).call(_ref, 0);
}
interface Prices {
  low: number[];
  high: number[];
}
export function hasPrice(prices: Prices, key: keyof Prices) {
  var _ref2;
  return _includesMaybeArray(_ref2 = prices[key]).call(_ref2, 1);
}