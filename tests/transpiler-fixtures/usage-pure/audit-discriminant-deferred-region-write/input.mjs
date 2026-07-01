// a DISCRIMINANT field write (`s.kind = "b"`) inside a loop body flips the variant the OUTER guard tested
// before the use re-reads it on the next iteration, so the narrow must drop to generic - a stale
// `_atMaybeArray` would throw on variant "b"'s string at runtime (ie:11). the write textually FOLLOWS the use,
// so the straight-line interval misses it; the guard interval is extended over the loop's re-exec region. a
// straight-line narrow with no intervening write stays precise (the contrast)
interface VariantA {
  kind: "a";
  arr: number[];
}
interface VariantB {
  kind: "b";
  arr: string;
}
type V = VariantA | VariantB;

function loopMutates(s: V, cond: () => boolean) {
  if (s.kind === "a") {
    while (cond()) {
      s.arr.at(-1);
      s.kind = "b";
    }
  }
}

function straightLine(s: V) {
  if (s.kind === "a") {
    s.arr.includes(1);
  }
}

// an IIFE runs synchronously, so the write AFTER it cannot reach the already-run use - the narrow HOLDS (a
// name-bound function called later could be re-invoked past the write, hence the loop / unbounded handling)
function iifeHolds(s: V) {
  if (s.kind === "a") {
    (() => {
      s.arr.at(-1);
    })();
  }
  s.kind = "b";
}
