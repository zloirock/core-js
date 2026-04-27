// `'from' in A2` where A2 follows alias chain back to Array. resolveObjectName must
// walk the const-init chain to surface the static receiver and fold the in-check to
// `true`. Map alias chain folds the same way once the receiver alias is resolved.
const A0 = Array;
const A1 = A0;
const A2 = A1;
const a = 'from' in A2;
const M0 = Map;
const M1 = M0;
const b = 'groupBy' in M1;
export { a, b };
