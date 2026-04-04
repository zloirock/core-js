type Tree = { left: Tree; right: Tree; value: string };
function f(t: Tree) { t.value.at(0); }
