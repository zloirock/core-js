// findTypeMember tuple branch line 1254: tuple['length'] returns TSNumberKeyword (the static arity).
// But tuple[0] etc resolves through findTupleElement. Edge: accessing 'length' on a tuple via member.
type Pair = [string, number[]];
declare const t: Pair;
const len = t.length;
const x = t[1].at(0);
