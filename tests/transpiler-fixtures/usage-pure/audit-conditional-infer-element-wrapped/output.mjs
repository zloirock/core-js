import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// infer-element pattern with wrapped trueType: `T extends (infer U)[] ? U[] : never`
// inferred element must be substituted back into the wrapped trueType body
type FlatOnce<T> = T extends (infer U)[] ? U[] : never;
declare const v: FlatOnce<number[][]>;
_atMaybeArray(v).call(v, 0);