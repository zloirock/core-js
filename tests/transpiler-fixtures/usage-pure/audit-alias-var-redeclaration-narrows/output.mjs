import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// duplicate `var`: a bare same-name redeclaration writes no value - the alias narrow must
// survive it in both orders (the binding may anchor on the bare declarator while the
// redeclaration carries the global); a redeclaration WITH init is a real write and the member
// keeps the user's value
var M = _Map;
var M;
export const r = typeof _Map$groupBy;
var P;
var P = _Promise;
export const q = typeof _Promise$try;
var S = _Set;
var S = {
  union: () => 'U'
};
export const u = S.union();