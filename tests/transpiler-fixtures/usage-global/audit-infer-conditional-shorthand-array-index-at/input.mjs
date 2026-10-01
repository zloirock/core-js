// numeric index into a `(infer U)[]`-shorthand infer-conditional (the TSArrayType extends form, vs
// `Array<infer U>` typeref): the inferred element threads through, so `v[0]` resolves to string[]
// and `.at` narrows to es.array.at
type E<T> = T extends (infer U)[] ? U[] : never;
declare const v: E<string[][]>;
v[0].at(0);
