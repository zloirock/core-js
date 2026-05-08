// `Self<T = T[]>` has a default that references its own type-param, forming a cycle.
// Substitution must short-circuit on revisit, otherwise depth-bound recursion alone wastes work.
type Self<T = T[]> = { items: T };
declare const r: Self;
r.items.at(0);
r.items.findLast(p => p);
