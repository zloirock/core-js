import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/esnext.iterator.join";
// A type-parameter outranks a same-named global: the annotation names the parameter, so the
// receiver stays opaque instead of picking up the built-in container's methods. A qualified
// reference cannot be shadowed, an ordinary parameter name leaves the global alone, and a
// parameter that carries a constraint still resolves through it.
declare const v: any;
function shadowed<Array>(x: Array) {
  return x.at(0);
}
namespace NS {
  export type Coll = number[];
}
function qualified<Coll>(x: NS.Coll) {
  return x.includes(1);
}
function unshadowed<T extends number[]>(x: T) {
  return x.find(n => n > 0);
}

// the shadow holds in a type-ARGUMENT too, which resolves through a different lane than an
// annotation written directly on the binding
type Boxed<T> = {
  inner: T;
};
function inArgument<Array>(x: Boxed<Array>) {
  return x.inner.join("-");
}

// what the parameter shadows is the GLOBAL, not itself: a constraint on a container-named
// parameter still resolves, so the array module below has to survive
function constrained<Array extends number[]>(x: Array) {
  return x.flat();
}