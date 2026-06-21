import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// mixed-arity interface merge: one sibling declares a type-param under a renamed
// name, the other has zero type-params and a fully-resolved property type. the
// zero-arity sibling must accept the receiver's type-args without trying to bind
// them - the subst map is empty when the sibling has no type-params, so it passes
// through unchanged. distinct methods (at vs includes) prove each line walked
// through its own sibling without cross-contamination.
interface Foo<T> { a: T }
interface Foo { b: number[] }
declare const f: Foo<string[]>;
_atMaybeArray(_ref = f.a).call(_ref, 0);
_includesMaybeArray(_ref2 = f.b).call(_ref2, 1);