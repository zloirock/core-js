// `T['a' | 'b']` resolves to a union of element types; the common parent (Array) wins
// so `.at(...)` uses the array variant.
type S = { a: string[]; b: number[] };
declare const v: S['a' | 'b'];
v.at(0);
