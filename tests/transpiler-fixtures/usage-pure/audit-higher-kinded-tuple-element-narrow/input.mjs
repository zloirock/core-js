// higher-kinded apply with a tuple type-arg: `Wrap<Array, [string, number]>` must
// substitute the tuple element into Array's inner slot. without applyHigherKindedArgs
// finding bound.constructor, the tuple type-arg is dropped and the element narrow
// falls back to the generic helper. tuple flattening picks the common element shape
// (`string | number` here) so the receiver carries the union; the narrow still
// recognises an array surface and emits the array-narrow polyfill.
type Wrap<F, X> = F<X>;
declare const xs: Wrap<Array, [string, number]>;
xs.at(0);
