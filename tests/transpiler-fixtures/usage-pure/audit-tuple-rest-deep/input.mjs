// deep tuple with rest: `[string, ...number[][]]` - findTupleElement walks
// elements, unwraps rest -> extractElementAnnotation. Check substitution still works
// when tuple is inside a generic alias.
type Pair<T> = [string, ...T[]];
declare const t: Pair<number[]>;
t[0].at(0);
t[1].at(0);
