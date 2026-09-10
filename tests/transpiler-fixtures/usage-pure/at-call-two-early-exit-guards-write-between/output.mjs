import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// two preceding guards on one binding with a reassignment between them: the earlier typeof guard
// is stale from the write on, and the nearest one - a type-neutral assertion - proves nothing about
// the family, so the union stays whole and both families inject. with the write before BOTH guards
// the typeof guard holds and the string alone injects
declare function decode(v: string | number[]): string | number[];
declare function assertPresent<T>(v: T): asserts v is NonNullable<T>;
export function stale(raw: string | number[]) {
  if (typeof raw !== 'string') return null;
  raw = decode(raw);
  assertPresent(raw);
  return _at(raw).call(raw, 0);
}
export function fresh(raw: string | number[]) {
  raw = decode(raw);
  if (typeof raw !== 'string') return null;
  assertPresent(raw);
  return _includesMaybeString(raw).call(raw, 'a');
}