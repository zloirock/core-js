import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Extract with a UNION target. TS distributes Extract<U, A | B> as
// Extract<U, A> | Extract<U, B>. resolveExtractExclude folds target via
// resolve(second) -> foldUnionTypes - if A and B are different outer shapes
// (string[] and number[]), foldUnionTypes returns null target and Extract bails.
// when A and B share the same outer (Array), inner types differ - common-type
// fold strips inner, leaving generic Array. probe whether narrow precision survives.
type Pool = number[] | string[] | Set<number>;
type Narrowed = Extract<Pool, number[] | string[]>;
declare const arr: Narrowed;
const first = _atMaybeArray(arr).call(arr, 0);
const found = _findLastMaybeArray(arr).call(arr, x => true);
export { first, found };