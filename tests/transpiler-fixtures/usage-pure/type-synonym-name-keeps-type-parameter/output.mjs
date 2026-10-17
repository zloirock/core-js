import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A constrained type parameter outranks a built-in synonym.
// The source constraint keeps String instance dispatch precise.
export function read<IteratorObject extends string>(value: IteratorObject) {
  return _atMaybeString(value).call(value, 0);
}