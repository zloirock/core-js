// Array-destructure reassign from a typed RHS: `let x; [x] = data` where `data: string[]`
// narrows `x` to string, so `x.at(0)` emits only the string-instance polyfill.
declare const data: string[];
let x;
[x] = data;
x.at(0);
