// a TS template literal type with NO expressions (just one quasi like `` `abc` ``) is
// equivalent to the string literal `'abc'`, not a prefix. only an exact-match member
// should pass the rename filter; partial matches like `abcdef` must NOT sneak through
type Filter<T> = { [K in keyof T as K extends `abc` ? K : never]: T[K] };
declare const r: Filter<{ abc: number[]; abcdef: string[] }>;
r.abc.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r.abcdef.includes('a');
