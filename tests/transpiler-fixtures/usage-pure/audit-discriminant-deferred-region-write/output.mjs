import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
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
      var _ref;
      _at(_ref = s.arr).call(_ref, -1);
      s.kind = "b";
    }
  }
}
function straightLine(s: V) {
  if (s.kind === "a") {
    var _ref2;
    _includesMaybeArray(_ref2 = s.arr).call(_ref2, 1);
  }
}

// an IIFE runs synchronously, so the write AFTER it cannot reach the already-run use - the narrow HOLDS (a
// name-bound function called later could be re-invoked past the write, hence the loop / unbounded handling)
function iifeHolds(s: V) {
  if (s.kind === "a") {
    (() => {
      var _ref3;
      _atMaybeArray(_ref3 = s.arr).call(_ref3, -1);
    })();
  }
  s.kind = "b";
}