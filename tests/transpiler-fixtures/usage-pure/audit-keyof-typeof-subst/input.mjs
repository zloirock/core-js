// `keyof typeof T` where T is a type parameter is semantically invalid TS, but the
// parser accepts it. Substitution does not preserve the typeof wrapper - resolved
// shape collapses through, but typeof-vs-direct semantics distinction is undefined
// for type-parameter operands. The unrelated array binding below is the assertion
// surface: substitution path must not corrupt unrelated resolution
type X<T> = keyof typeof T;
type Y = X<number>;
declare const y: Y;
declare const arr: number[];
y;
arr.at(-1);
