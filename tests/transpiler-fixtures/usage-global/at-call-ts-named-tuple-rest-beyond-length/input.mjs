type T = [first: number, ...rest: string[]];
function f(x: T[2]) { x.at(0); }
