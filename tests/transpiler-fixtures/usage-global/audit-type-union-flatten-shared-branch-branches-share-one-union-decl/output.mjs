import "core-js/modules/es.array.at";
// A discriminant test needs the union flattened first, and the flattener carries a set so a union nested in itself stops.
type Inner = {
  kind: "a";
  items: string[];
} | {
  kind: "b";
  items: string;
};
type SharedBranches = Inner | Inner;
declare const shared: SharedBranches;
// both branches reach the same nested union declaration - re-reaching it is the sibling, not a cycle
export function branchesShareOneUnionDecl() {
  if (shared.kind === "a") return shared.items.at(0);
  return "";
}