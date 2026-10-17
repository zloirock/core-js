{
function f(a = [1]) { return a; } const v = f(...[[1, 2]]); v.at(0);
}
