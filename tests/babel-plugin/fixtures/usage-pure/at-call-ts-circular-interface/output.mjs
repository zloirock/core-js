import _at from "@core-js/pure/actual/string/at";
import _at2 from "@core-js/pure/actual/array/at";
interface TreeNode {
  children: TreeNode[];
  name: string;
}
function f(n: TreeNode) {
  var _ref, _ref2;
  _at(_ref = n.name).call(_ref, 0);
  _at2(_ref2 = n.children).call(_ref2, 0);
}