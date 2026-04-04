type HasName = { name: string };
type HasChildren<T> = { children: T[] };
type TreeNode = HasName & HasChildren<TreeNode>;
function f(t: TreeNode) { t.name.at(0); t.children.at(0); }
