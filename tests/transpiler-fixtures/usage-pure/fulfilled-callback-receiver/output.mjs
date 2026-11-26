import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type Done<T> = (...args: [value: T]) => void;
interface Task {
  then(cb: Done<{
    text: string;
  }> | null): void;
}
export function read(value: Awaited<Task>) {
  var _ref;
  return _atMaybeString(_ref = value.text).call(_ref, 0);
}
export async function first(source: Iterable<PromiseLike<number[]>>) {
  for await (const item of source) return _atMaybeArray(item).call(item, 0);
}
export async function lastName(source: AsyncIterable<Promise<{
  name: string;
}>>) {
  for await (const _ref2 of source) {
    const name = _nameMaybeFunction(_ref2);
    return _atMaybeString(name).call(name, -1)?.toUpperCase();
  }
}