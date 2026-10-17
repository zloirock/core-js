// HKT apply with type-arg = `null`: a nullable inner is rejected and collapses to null,
// so the rebuilt container stays generic. `.includes` on the bound container still
// surfaces an Array dispatch, but the inner-element narrow stays generic (matches the
// parameter)
type Wrap<F, X> = F<X>;
declare const r: Wrap<Array, null>;
r.includes(null);
