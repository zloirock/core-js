import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// Outer alias type-param `K` shadowed by mapped-type's inner `K` binding. When the alias
// chain folds outer-K substitution into the mapped body, capture would replace the inner-
// bound K references with the outer K substitute. Each method probes a different field type
// so per-key dispatch is observable in the emitted imports.
type Wrap<K> = { [K in keyof {
  items: number[];
  name: string[];
}]: {
  items: number[];
  name: string[];
}[K] };
declare const r: Wrap<symbol>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_includesMaybeArray(_ref2 = _nameMaybeFunction(r)).call(_ref2, 'foo');