// an undecided conditional type folds both branches like union arms: a branch the resolver cannot
// resolve - a cross-module type - may be the runtime shape, so it sinks the fold and the generic
// helper dispatches, never the other branch as certain. a nullish branch still strips (the second
// conditional resolves to its string branch)
import type { Rows } from './rows';
interface MyList { [Symbol.iterator](): Iterator<number[]> }
type Pick1<T> = T extends Iterable<unknown> ? Rows : string;
type Pick2<T> = T extends Iterable<unknown> ? null : string;
declare const p: Pick1<MyList>;
declare const q: Pick2<MyList>;
export const a = p.at(0);
export const b = q.includes('a');
