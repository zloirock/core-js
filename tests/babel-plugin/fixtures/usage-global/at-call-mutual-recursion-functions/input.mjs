function f() { return g(); }
function g() { return f(); }
f().at(0);
