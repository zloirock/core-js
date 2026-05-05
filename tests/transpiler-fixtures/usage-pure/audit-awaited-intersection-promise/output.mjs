import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Awaited<Promise<X> & Y>` per TS spec distributes over intersection:
// `Awaited<A & B>` -> `Awaited<A> & Awaited<B>`. resolveAwaitedAnnotation peels
// the Promise<X> branch to X, foldIntersectionTypes drops the plain object branch
// `{ tag: 'arr' }` (collapsed to $Object('Object')), result is X. distinct prototype
// methods per line so each narrowing fires through the same Awaited result
async function isectAwait() {
  type Tagged = Promise<number[]> & {
    tag: 'arr';
  };
  type Result = Awaited<Tagged>;
  declare const r: Result;
  _atMaybeArray(r).call(r, 0);
  _includesMaybeArray(r).call(r, 1);
}
isectAwait();