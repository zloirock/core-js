// Exclude<T, never> keeps all members of T (TS spec). The never-keyword target resolves
// to the `never` primitive, and no member of `number[] | string[]` is assignable to
// `never` (a member is excluded only when assignable to the target). So every member is
// kept and `.at()` / `.findLast()` narrow against the surviving Array union.
type Pool = number[] | string[];
type Result = Exclude<Pool, never>;
declare const v: Result;
v.at(0);
v.findLast(x => true);
