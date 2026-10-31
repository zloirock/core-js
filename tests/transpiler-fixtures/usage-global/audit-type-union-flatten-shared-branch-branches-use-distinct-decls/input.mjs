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
  if (distinct.kind === "a") return distinct.entries.includes("x");
  return false;
}
