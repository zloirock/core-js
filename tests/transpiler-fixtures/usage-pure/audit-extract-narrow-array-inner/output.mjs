import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Extract<number[] | string[], string[]>` must narrow to `string[]` by comparing inner
// types, not just outer Array constructor. otherwise the narrowed type would stay as the
// full union and `.at(0)` / `.includes('a')` would lose precision
type Narrowed = Extract<number[] | string[], string[]>;
declare const arr: Narrowed;
const first = _atMaybeArray(arr).call(arr, 0);
const has = _includesMaybeArray(arr).call(arr, 'a');
export { first, has };