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
  if (shared.kind === "a") return shared.items.at(0);
  return "";
}

// the control: one declaration per branch, so nothing is re-reached either way
export function branchesUseDistinctDecls() {
  if (distinct.kind === "a") return distinct.entries.includes("x");
  return false;
}
