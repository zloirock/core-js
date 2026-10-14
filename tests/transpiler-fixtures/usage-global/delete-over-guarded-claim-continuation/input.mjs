// A deleted member over a claim behind the receiver's `?.` hides nothing from usage detection: the
// operator acting on the chain past the claim pulls each claim's module as a plain read of the same
// chain would, whether a `?.` of the source's own or of the claim's own call stands in between.
let boxes;
delete boxes?.at(-1).j.k;
delete boxes?.findLast(Boolean).j?.k;
delete boxes?.toReversed?.()[0].k;
