interface TreeNode { children: TreeNode[]; name: string; }
function f(n: TreeNode) { n.name.at(0); n.children.at(0); }
