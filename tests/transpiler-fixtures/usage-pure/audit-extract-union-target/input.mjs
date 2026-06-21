// Extract with a UNION target. TS distributes Extract<U, A | B> as
// Extract<U, A> | Extract<U, B>. Folding the target union: if A and B are different outer
// shapes (string[] and number[]) the fold yields no target and Extract bails. when A and B
// share the same outer (Array) but differ inside, the common-type fold strips the inner
// type, leaving generic Array. probe whether narrow precision survives.
type Pool = number[] | string[] | Set<number>;
type Narrowed = Extract<Pool, number[] | string[]>;
declare const arr: Narrowed;
const first = arr.at(0);
const found = arr.findLast(x => true);
export { first, found };
