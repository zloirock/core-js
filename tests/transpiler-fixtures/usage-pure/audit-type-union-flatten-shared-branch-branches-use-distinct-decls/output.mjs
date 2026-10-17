import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _entries from "@core-js/pure/actual/instance/entries";
type Twin = {
  kind: "a";
  entries: string[];
} | {
  kind: "b";
  entries: string;
};
type DistinctBranches = Twin | {
  kind: "c";
  entries: string[];
};
declare const distinct: DistinctBranches;
// the control: one declaration per branch, so nothing is re-reached either way
export function branchesUseDistinctDecls() {
  var _ref;
  if (distinct.kind === "a") return _includesMaybeArray(_ref = _entries(distinct)).call(_ref, "x");
  return false;
}