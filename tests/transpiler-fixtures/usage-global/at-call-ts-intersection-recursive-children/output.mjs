import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
type HasName = {
  name: string;
};
type HasChildren<T> = {
  children: T[];
};
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type TreeNode = HasName & HasChildren<TreeNode>;
function f(t: TreeNode) {
  t.name.at(0);
  t.children.at(0);
}