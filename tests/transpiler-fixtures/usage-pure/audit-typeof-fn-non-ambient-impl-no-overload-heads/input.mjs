// non-ambient impl WITHOUT preceding overload heads. with no ambient sibling heads,
// impl-with-heads retargeting stays off and the impl's own signature drives `typeof fn`.
// body inference of `return null as any` is null - `r` resolves to null on both init AND
// annotation sides; no Array narrow. negative control: retargeting must be gated on
// actually having heads, not on the impl predicate alone
function fn(x: any): any { return null as any; }
const r: ReturnType<typeof fn> = fn(0);
r.at(0);
