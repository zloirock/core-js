// A deleted member standing past a `!` over a guarded claim takes the claim's short-circuit: the
// assertion continues the chain, so the whole operator rides the guard, and a claim yielding
// `undefined` on a present receiver is read plainly, throwing as the source does. A paren between
// them seals instead, and the delete reads the guard's value plainly.
declare const boxes: { k?: number; j?: { k?: number } }[] | null;
delete boxes?.at(-1)!.k;
delete boxes?.findLast(Boolean)!!.j!.k;
delete (boxes?.toReversed())!.k;
