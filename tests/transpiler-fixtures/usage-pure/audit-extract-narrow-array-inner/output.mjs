import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Extract<Array<number>|Array<string>, Array<string>>` must narrow to Array<string>
// by comparing inner types. without inner-aware isAssignableTo, Array<number> would also
// match and the narrowed result would be the union (losing precision)
type Narrowed = Extract<number[] | string[], string[]>;
declare const arr: Narrowed;
const first = _atMaybeArray(arr).call(arr, 0);
const has = _includesMaybeArray(arr).call(arr, 'a');
export { first, has };