type Tree = { children: Tree[]; label: string };
declare const t: Tree;
t.children.includes(t);
t.label.at(-1);
