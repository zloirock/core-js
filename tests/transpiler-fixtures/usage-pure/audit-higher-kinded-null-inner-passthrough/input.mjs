// HKT apply with type-arg = `null`: a nullable inner is rejected and collapses to null,
// so the rebuilt container stays generic. `.includes` on the bound container still
// surfaces an Array dispatch, but the inner-element narrow stays generic (matches the
// parameter)
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Wrap<F, X> = F<X>;
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const r: Wrap<Array, null>;
r.includes(null);
