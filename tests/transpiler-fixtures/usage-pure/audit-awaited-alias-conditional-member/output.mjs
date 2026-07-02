import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// `Awaited<Cond<T>>` wraps a multi-hop conditional that resolves to an object with array fields.
// Conditional branch picking must fire so member access on the resolved object narrows precisely.
type Cond<X> = X extends string ? never : {
  items: X[];
  tags: string[];
};
type Wrap<Y> = Cond<Y>;
declare const r: Awaited<Wrap<number>>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_includesMaybeArray(_ref2 = r.tags).call(_ref2, 'x');