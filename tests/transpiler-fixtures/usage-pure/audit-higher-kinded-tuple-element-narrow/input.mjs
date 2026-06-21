// higher-kinded apply with a tuple type-arg: `Wrap<Array, [string, number]>` must
// substitute the tuple element into Array's inner slot, else the type-arg is dropped and
// the element narrow falls back to the generic helper. tuple flattening picks the common
// element shape (`string | number`); the narrow still emits the array-narrow polyfill.
type Wrap<F, X> = F<X>;
declare const xs: Wrap<Array, [string, number]>;
xs.at(0);
