// chained generic alias where outer subst's compound arg references INNER alias's own
// type-param. `type Outer<T> = Inner<T[]>; type Inner<U> = U[]` instantiated as
// `Outer<number>` builds subst {T: number, U: T[]}. without cycle-guard via `visited` Set
// on param names, naive `subst.get('U')` yields T[] which would re-substitute via outer
// subst loop until depth-bound. cycle guard restores after recursion via try/finally so
// the second occurrence of the same param doesn't self-bail. result: `r` resolves to
// `number[][]` (array of arrays). distinct methods discriminate narrow Array hint
type Inner<U> = U[];
type Outer<T> = Inner<T[]>;
declare const r: Outer<number>;
r.at(0);
r.includes([]);
