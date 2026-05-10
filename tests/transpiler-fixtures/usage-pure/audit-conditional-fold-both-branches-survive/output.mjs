import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// undecidable conditional with BOTH branches yielding viable members; fold builds union
// preserving member dispatch on each
type Wrap<T> = T extends string ? {
  items: number[];
} : {
  items: string[];
};
declare const w: Wrap<number>;
_atMaybeArray(_ref = w.items).call(_ref, 0);
_flatMaybeArray(_ref2 = w.items).call(_ref2);