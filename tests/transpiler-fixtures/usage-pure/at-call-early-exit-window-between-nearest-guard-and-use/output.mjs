import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// the window a reassignment can occupy between the NEAREST preceding early-exit guard and the use.
// a write hosted in a neighbouring guard's own exiting branch escapes the collector's floor, so only
// this window catches it and the union stays whole - and it answers alike for every read at that
// level, which needs one method per read or the second would answer inside the first's import. a
// write standing before the nearest guard is outside the window and the narrow holds
declare function decode(v: string | number[]): string | number[];
declare function assertPresent<T>(v: T): asserts v is NonNullable<T>;
export function inside(raw: string | number[], other: unknown) {
  if (typeof raw !== 'string') return null;
  if (typeof other !== 'string') {
    raw = decode(raw);
    return null;
  }
  _globalThis.a = _includes(raw).call(raw, 'a');
  return _keys(raw).call(raw);
}
export function before(raw: string | number[]) {
  raw = decode(raw);
  if (typeof raw !== 'string') return null;
  assertPresent(raw);
  const pad = 1;
  return _atMaybeString(raw).call(raw, pad - 1);
}