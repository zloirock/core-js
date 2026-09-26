// numeric index into a `ReadonlyArray<infer U>` infer-conditional: the readonly wrapper is peeled,
// the inferred element threads through, and `.at` narrows to es.array.at
type R<T> = T extends ReadonlyArray<infer U> ? U[] : never;
declare const v: R<number[][]>;
v[0].at(0);
