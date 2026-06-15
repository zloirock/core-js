import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a method that declares its own `<T>` shadows the enclosing generic alias's `T`. applying the alias's
// `T -> number[]` substitution to the method return would capture the method-local T and emit the
// array-specific helper on a foreign return (ie:11 throw). the method-local param is shadowed to unknown
// (generic); an alias method WITHOUT its own type param still binds the outer T (array-specific).
type Shadowed<T> = { pick<T>(): T };
declare const s: Shadowed<number[]>;
_at(_ref = s.pick()).call(_ref, 0);
type Bound<T> = { all(): T[] };
declare const bnd: Bound<number>;
_includesMaybeArray(_ref2 = bnd.all()).call(_ref2, 1);