// `string[] | never` — `never` is nullable/never → foldUnionTypes skips; result = string[].
// tests that the never-skip works (shouldn't bail).
type Maybe = string[] | never;
declare const m: Maybe;
m.at(0);
m.includes('x');
