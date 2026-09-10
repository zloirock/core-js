// Extract with a UNION target. TS distributes Extract<U, A | B> as Extract<U, A> | Extract<U, B>,
// and so does the resolver: each source member is asked about every target ARM, not about their
// folded shape. `Set<number>` is the member the arms decide: the supertype table names both `Set`
// and `Array` and carries no path between them either way, so the member is EXCLUDED rather than
// sinking the whole result, and the two array arms fold into an element-precise receiver.
type Pool = number[] | string[] | Set<number>;
type Narrowed = Extract<Pool, number[] | string[]>;
declare const arr: Narrowed;
const first = arr.at(0);
const found = arr.findLast(x => true);
export { first, found };
