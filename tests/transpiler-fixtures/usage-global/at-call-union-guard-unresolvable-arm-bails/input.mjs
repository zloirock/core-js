// a union arm the resolver cannot resolve - a cross-module type - may be the runtime value: a guard
// that does not rule it out leaves the union whole, exactly as the same annotation resolves with no
// guard at all, so the generic helper dispatches and both families inject. a guard that RULES the
// other arms out still narrows (the literal `typeof` on the resolvable arm)
import type { Cursor } from './cursor';
declare function assertPresent<T>(v: T): asserts v is NonNullable<T>;
export function imported(x: number[] | Cursor | null) {
  assertPresent(x);
  return x.at(0);
}
export function ruledOut(x: string | Cursor) {
  if (typeof x === 'string') return x.includes('a');
  return null;
}
