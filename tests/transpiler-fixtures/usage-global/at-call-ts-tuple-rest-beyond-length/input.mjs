type T = [number, ...string[]];
function f(x: T[2], y: T[5]) { x.at(0); y.at(0); }
