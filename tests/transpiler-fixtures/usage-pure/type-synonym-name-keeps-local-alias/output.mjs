import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A local alias keeps its body before a built-in synonym is normalized.
// The written String receiver requires String instance dispatch.
export {};
type PromiseLike<T> = string;
export function read(value: PromiseLike<number>) {
  return _atMaybeString(value).call(value, 0);
}