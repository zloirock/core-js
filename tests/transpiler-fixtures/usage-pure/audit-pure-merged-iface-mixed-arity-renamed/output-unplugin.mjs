import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// mixed-arity interface merge: one sibling declares a type-param under a renamed
// name, the other has zero type-params and a fully-resolved property type. the
// zero-arity sibling must accept the receiver's typeArgs without trying to bind
// them - buildSubstMap returns null when declParams is empty so the sibling
// passes through unchanged. distinct methods (at vs includes) prove each line
// walked through its own sibling without cross-contamination.
interface Foo<T> { a: T }
interface Foo { b: number[] }
declare const f: Foo<string[]>;
_atMaybeArray(_ref = f.a).call(_ref, 0);
_includesMaybeArray(_ref2 = f.b).call(_ref2, 1);