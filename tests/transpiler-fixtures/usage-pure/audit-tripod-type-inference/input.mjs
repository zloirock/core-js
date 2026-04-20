// three mechanics, three intermediates - each receiver's type comes from exactly
// one source. in usage-pure mode the module registry has no iterator/instance
// override for `.filter` / `.map` / `.flatMap` (iterator helpers flow through a
// separate entry), so every receiver resolves to `array/instance/*`; the chain
// still exercises all three mechanics for TS / guard / built-in inference:
//   (1) TS annotation `typed: number[]`   -> .filter receiver is Array
//   (2) guard `Array.isArray(maybe)`      -> .map    receiver is Array
//   (3) built-in return of `Array.from`   -> .flatMap receiver is Array
function aggregate(typed: number[], maybe: unknown, raw: Iterable<number>): number[] {
  if (!Array.isArray(maybe)) return [];
  const fromTyped = typed.filter(x => x > 0);
  const fromGuard = maybe.map(x => Number(x));
  const fromIter = Array.from(raw).flatMap(x => [x, -x]);
  return fromTyped.concat(fromGuard, fromIter).toSorted((a, b) => a - b);
}
