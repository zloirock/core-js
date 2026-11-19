{
function f({ x }) { return x; } const v = f(...[{ x: [1] }]); v.at(0);
}
