// three receivers, each typed as Array from a distinct source: (1) TS annotation
// `typed: number[]` -> .filter, (2) `Array.isArray(maybe)` guard -> .map, (3) built-in
// return of `Array.from` -> .flatMap. `.filter`/`.map`/`.flatMap` also live on
// Iterator.prototype, so a missed receiver type would pull all three module families.
function aggregate(typed: number[], maybe: unknown, raw: Iterable<number>): number[] {
  if (!Array.isArray(maybe)) return [];
  const fromTyped = typed.filter(x => x > 0);
  const fromGuard = maybe.map(x => Number(x));
  const fromIter = Array.from(raw).flatMap(x => [x, -x]);
  return fromTyped.concat(fromGuard, fromIter).toSorted((a, b) => a - b);
}
