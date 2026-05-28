import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// HKT-style alias where F is a USER alias (not a built-in container). `Wrap<F, X> = F<X>`
// splices F=Boxed at AST level inside the alias chain walker so the chain keeps descending
// into Boxed<string[]> and x.val resolves to string[]. .at(0) narrows to array
type Boxed<T> = { val: T };
type Wrap<F, X> = F<X>;
declare const x: Wrap<Boxed, string[]>;
_atMaybeArray(_ref = x.val).call(_ref, 0);