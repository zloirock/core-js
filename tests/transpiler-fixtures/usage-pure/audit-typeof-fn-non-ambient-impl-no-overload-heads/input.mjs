// non-ambient impl WITHOUT preceding overload heads. `findOverloadsForName` returns no
// ambient siblings, so impl-with-heads retargeting stays off and the impl's own signature
// drives `typeof fn`. body inference of `return null as any` gives `$Primitive('null')` -
// `r` resolves to null on both init AND annotation sides; no Array narrow possible. negative
// control: ensures retargeting is gated on actually having heads, not on impl predicate alone
function fn(x: any): any { return null as any; }
const r: ReturnType<typeof fn> = fn(0);
r.at(0);
