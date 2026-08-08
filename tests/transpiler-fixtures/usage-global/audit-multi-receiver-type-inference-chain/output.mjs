import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.iterator";
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