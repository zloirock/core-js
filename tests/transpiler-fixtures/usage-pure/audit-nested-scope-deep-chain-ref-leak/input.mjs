// deeply nested scope chain where temporary `_ref` allocation could leak: each scope
// level keeps its own temporary bindings.
function f(x) { return x?.at(0)?.at(0)?.at(0)?.includes(1); }
