import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
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
function straightLine(s: V) {
  if (s.kind === "a") {
    var _ref;
    _includesMaybeArray(_ref = s.arr).call(_ref, 1);
  }
}