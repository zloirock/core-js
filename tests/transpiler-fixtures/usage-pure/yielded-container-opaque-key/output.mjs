import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
// An unknown key selects constructor slots for named static reads, without exposing the namespace.
// Returned, inline and nested containers contribute the same per-key candidates in global.
function box(v) {
  return [v];
}
const nested = {
  a: [_Promise]
};
export const yielded = box(_Map)[key].groupBy([1], x => x);
export const inPlace = [_Symbol][key].for('x');
export const hop = nested.a[key].withResolvers();