// infer-element pattern with wrapped trueType: `T extends (infer U)[] ? U[] : never`
// inferred element must be substituted back into the wrapped trueType body
type FlatOnce<T> = T extends (infer U)[] ? U[] : never;
declare const v: FlatOnce<number[][]>;
v.at(0);
