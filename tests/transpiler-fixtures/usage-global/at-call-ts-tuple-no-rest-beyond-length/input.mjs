type T = [number, string];
// @ts-expect-error a tuple index tsc refuses is the shape under test
function f(x: T[2]) { x.at(0); }
