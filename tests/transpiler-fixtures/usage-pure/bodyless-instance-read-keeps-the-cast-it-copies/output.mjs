import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// a bodyless `var` whose instance read spells its receiver again keeps the receiver's TS wrappers - a cast,
// a non-null assertion - in the copy the dispatch reads, on both legs; a decided selection inside the cast
// folds to its live operand there, as it does unwrapped
export function pick(ready: boolean, list: any, other: any) {
  if (ready) var at = _at((list) as any);else var flat = _flatMaybeArray(list!);
  return [at, flat];
}