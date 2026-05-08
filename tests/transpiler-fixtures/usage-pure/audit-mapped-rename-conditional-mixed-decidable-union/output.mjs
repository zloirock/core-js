import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Conditional rename `K extends 'items' | SomeRef` mixes a decidable literal with an undecidable type-ref.
// Decidable keys keep their array narrow; undecidable keys must drop to generic dispatch as a safe upper bound.
type SomeRef = number;
type Pick1<T> = { [K in keyof T as K extends 'items' | SomeRef ? K : never]: T[K] };
declare const r: Pick1<{
  items: number[];
  other: string;
}>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_includes(_ref2 = r.other).call(_ref2, 'a');