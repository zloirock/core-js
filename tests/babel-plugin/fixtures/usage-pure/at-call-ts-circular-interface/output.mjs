import _atInstanceProperty from "@core-js/pure/actual/instance/at";
interface TreeNode {
  children: TreeNode[];
  name: string;
}
function f(n: TreeNode) {
  var _ref, _ref2;
  _atInstanceProperty(_ref = n.name).call(_ref, 0);
  _atInstanceProperty(_ref2 = n.children).call(_ref2, 0);
}