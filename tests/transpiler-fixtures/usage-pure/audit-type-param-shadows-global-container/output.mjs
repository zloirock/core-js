import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _at from "@core-js/pure/actual/instance/at";
// A type-parameter outranks a same-named global: the annotation names the parameter, so the
// receiver stays opaque instead of picking up the built-in container's methods. A qualified
// reference cannot be shadowed, an ordinary parameter name leaves the global alone, and a
// parameter that carries a constraint still resolves through it.
declare const v: any;
function shadowed<Array>(x: Array) {
  return _at(x).call(x, 0);
}
namespace NS {
  export type Coll = number[];
}
function qualified<Coll>(x: NS.Coll) {
  return _includesMaybeArray(x).call(x, 1);
}
function unshadowed<T extends number[]>(x: T) {
  return _findMaybeArray(x).call(x, n => n > 0);
}

// the shadow holds in a type-ARGUMENT too, which resolves through a different lane than an
// annotation written directly on the binding
type Boxed<T> = {
  inner: T;
};
function inArgument<Array>(x: Boxed<Array>) {
  var _ref;
  return _joinMaybeArray(_ref = x.inner).call(_ref, "-");
}

// what the parameter shadows is the GLOBAL, not itself: a constraint on a container-named
// parameter still resolves, so the array module below has to survive
function constrained<Array extends number[]>(x: Array) {
  return _flatMaybeArray(x).call(x);
}