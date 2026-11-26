type Elem<T> = T extends Array<(infer U)> ? U[] : never;
declare const inferred: Elem<number[][]>;
inferred.at(0).at(1);
