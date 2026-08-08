type Tree = { children: Tree[]; label: string };
declare const t: Tree;
t.children.at(0);
