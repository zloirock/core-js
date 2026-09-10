import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
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
  globalThis.a = raw.includes('a');
  return raw.keys();
}
export function before(raw: string | number[]) {
  raw = decode(raw);
  if (typeof raw !== 'string') return null;
  assertPresent(raw);
  const pad = 1;
  return raw.at(pad - 1);
}