// higher-kinded type alias applied with an inner argument. After resolution
// the bound instance must be rebuilt with the substituted inner so the second
// member call narrows on the inner element type, not on the bare container.
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Wrap<F, X> = F<X>;
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const r: Wrap<Array, string>;
r.at(0)?.at(0);
