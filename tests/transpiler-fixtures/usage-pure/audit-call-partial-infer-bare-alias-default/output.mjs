import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `<T, U = T>(t: T): U` - the return type U defaults to a BARE alias of inferred T.
// partial-infer fill must populate U from its default and resolve U through `T` to the
// inferred argument annotation (string[]), so `.at` narrows to the array variant
declare function makeBox<T, U = T>(t: T): U;
declare const v: string[];
const x = makeBox(v);
export const r = _atMaybeArray(x).call(x, 0);