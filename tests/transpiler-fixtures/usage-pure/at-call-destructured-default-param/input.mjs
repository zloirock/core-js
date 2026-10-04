// A nested parameter default keeps its receiver memo local to that evaluation.
// Supplied properties still bypass the default and its dispatch.
function f({ a = [1].at(0) }) { return a; }
