// A later type-param default that references an earlier param (`U = T`) must resolve
// against the already-bound earlier param, so the alias instantiation narrows to the
// concrete array type instead of an unbound param.
type Q<T, U = T> = U;
let x: Q<number[]>;
x.at(-1);
