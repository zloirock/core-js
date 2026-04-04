var _ref, _ref1;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface TreeNode { children: TreeNode[]; name: string; }
function f(n: TreeNode) { _atMaybeString(_ref = n.name).call(_ref, 0); _atMaybeArray(_ref1 = n.children).call(_ref1, 0); }