import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Awaited unwraps the branch selected by the instantiated right-hand type.
type Pick<T, U> = T extends U ? Promise<string> : Promise<number[]>;
declare function probe<T, U>(): Awaited<Pick<T, U>>;
const data = await probe<Array<number>, Array<string>>();
const text = await probe<Array<string>, Array<string>>();
_atMaybeArray(data).call(data, 0);
_includesMaybeString(text).call(text, 'x');
export {};