import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
interface TreeNode {
  children: TreeNode[];
  name: string;
}
function f(n: TreeNode) {
  n.name.at(0);
  n.children.at(0);
}