const rest = [];
{
function f(a = [1]) { return a; } const v = f(...rest); v.at(0);
}
