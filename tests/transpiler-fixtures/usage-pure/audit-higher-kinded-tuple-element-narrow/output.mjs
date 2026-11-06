import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// higher-kinded apply with a tuple type-arg: `Wrap<Array, [string, number]>` must
// substitute the tuple element into Array's inner slot, else the type-arg is dropped and
// the element narrow falls back to the generic helper. tuple flattening picks the common
// element shape (`string | number`); the narrow still emits the array-narrow polyfill.
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Wrap<F, X> = F<X>;
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const xs: Wrap<Array, [string, number]>;
_atMaybeArray(xs).call(xs, 0);