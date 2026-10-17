import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Flow aliases use their declared bodies before built-in synonym normalization.
// This String body requires String instance dispatch.
type Thenable<T> = string;
export function read(value: Thenable<number>) {
  return _atMaybeString(value).call(value, 0);
}