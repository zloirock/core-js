import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// `keyof (A & B)` source-side intersection mixes keys from both branches under one rename.
// `Capitalize` rename must apply uniformly so per-field narrows survive across the intersection.
type A = {
  items: number[];
};
type B = {
  name: string;
};
type Pickled<T> = { [K in keyof T as Capitalize<K & string>]: T[K] };
declare const r: Pickled<A & B>;
_atMaybeArray(_ref = r.Items).call(_ref, 0);
_includesMaybeString(_ref2 = r.Name).call(_ref2, 'a');