// A dominating realm initializer permits a named static read without a constructor namespace.
var g = globalThis;
function f() { return g.Promise.resolve(1); }
export const result = typeof f().then;
