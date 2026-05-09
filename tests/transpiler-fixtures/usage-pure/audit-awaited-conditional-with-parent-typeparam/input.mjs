// Awaited<> wraps a conditional that references the parent type-param - the conditional
// fires its true-branch with `T = string[]`, so the awaited inner is `string[]` and
// `r.at` should dispatch under array-narrow
type Cond<T> = T extends unknown ? T : never;
declare function probe<T>(): Awaited<Cond<T>>;
const r = await probe<string[]>();
r.at(0);
