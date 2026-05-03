import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// expandMappedTypeMembers source-side intersection: `keyof (A & B)` enumerates
// keys from both. Helper must descend through getTypeMembers on the intersection
// node and produce a member set that mixes A and B keys. Capitalize rename should
// apply uniformly. Stresses interaction between intersection-aware getTypeMembers
// and the rename-template intrinsic transformer.
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