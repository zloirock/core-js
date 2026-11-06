// A closure declared before the realm initializer retains the constructor's static family.
function f() { return g.Promise.resolve(1); }
var g = globalThis;
export const result = typeof f().then;
