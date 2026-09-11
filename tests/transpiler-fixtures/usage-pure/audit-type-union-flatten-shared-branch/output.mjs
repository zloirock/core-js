import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _entries from "@core-js/pure/actual/instance/entries";
// a discriminant test needs the union flattened first, and the flattener carries a set so a union
// nested in itself stops. scoped to the whole walk instead of the current descent, a second branch
// reaching the SAME nested union is left unexpanded: the discriminant then reads a union where it
// expects a member, matches nothing, and the proven arm's type is lost. the rows differ ONLY in
// whether the two branches go through one declaration - both must narrow
type Inner = {
  kind: "a";
  items: string[];
} | {
  kind: "b";
  items: string;
};
type Twin = {
  kind: "a";
  entries: string[];
} | {
  kind: "b";
  entries: string;
};
type SharedBranches = Inner | Inner;
type DistinctBranches = Twin | {
  kind: "c";
  entries: string[];
};
declare const shared: SharedBranches;
declare const distinct: DistinctBranches;

// both branches reach the same nested union declaration - re-reaching it is the sibling, not a cycle
export function branchesShareOneUnionDecl() {
  var _ref;
  if (shared.kind === "a") return _atMaybeArray(_ref = shared.items).call(_ref, 0);
  return "";
}

// the control: one declaration per branch, so nothing is re-reached either way
export function branchesUseDistinctDecls() {
  var _ref2;
  if (distinct.kind === "a") return _includesMaybeArray(_ref2 = _entries(distinct)).call(_ref2, "x");
  return false;
}