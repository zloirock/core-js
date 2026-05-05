import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Extract<U, T> where U has a `never` member: never absorbs in TS unions ('a' | never = 'a'),
// but the AST may carry `never` literally. resolveExtractExclude iterates union members and
// calls `resolve(member)` on each. For TSNeverKeyword, resolveTypeAnnotation returns
// $Primitive('never'). Probe that never-member does not interfere with sibling assignability:
// number[] member should match the target.
type Pool = number[] | never;
type Filtered = Extract<Pool, number[]>;
declare const arr: Filtered;
_atMaybeArray(arr).call(arr, 0);
_findLastMaybeArray(arr).call(arr, x => true);