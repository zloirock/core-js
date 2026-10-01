// an object-literal arg with a getter AND a setter for the same key: the setter contributes no
// readable value (skipped, iteration continues to the paired getter), the getter's return type flows
// into `T['k']`, so `r` is `number[]` and `.at` narrows to the array variant
function get<T extends { k: unknown }>(o: T): T["k"] { return o.k; }
const r = get({ get k() { return [1, 2, 3]; }, set k(v: number[]) {} });
r.at(0);
