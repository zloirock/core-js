// duplicate `var`: a bare same-name redeclaration writes no value - the alias narrow must
// survive it in both orders (the binding may anchor on the bare declarator while the
// redeclaration carries the global); a redeclaration WITH init is a real write and the member
// keeps the user's value
var { Map: M } = globalThis;
var M;
export const r = typeof M.groupBy;
var P;
var { Promise: P } = globalThis;
export const q = typeof P.try;
var { Set: S } = globalThis;
var S = { union: () => 'U' };
export const u = S.union();
