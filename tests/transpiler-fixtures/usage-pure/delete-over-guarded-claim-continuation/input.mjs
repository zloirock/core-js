// A deleted member over a claim behind the receiver's `?.` belongs to the chain that `?.` ends: a
// nullish receiver deletes nothing and answers `true`, so the whole operator rides the guard. A
// claim yielding `undefined` on a present receiver is then read plainly past it and throws, as the
// source does - unless a `?.` of the source's own, or of the claim's own call, stands in between.
let boxes;
delete boxes?.at(-1).j.k;
delete boxes?.findLast(Boolean).j?.k;
delete boxes?.toReversed?.()[0].k;
