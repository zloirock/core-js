import _at from "@core-js/pure/actual/instance/at";
// A DISCRIMINANT field write (`s.kind = "b"`) inside a loop body flips the variant the OUTER guard tested before the use re-reads
// it on the next iteration, so the narrow must drop to generic - a stale `_atMaybeArray` would throw on variant "b"'s string at
// runtime (ie:11).
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