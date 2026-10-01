// An unknown key selects constructor slots for named static reads, without exposing the namespace.
// Returned, inline and nested containers contribute the same per-key candidates in global.
function box(v) { return [v]; }
const nested = { a: [Promise] };
export const yielded = box(Map)[key].groupBy([1], x => x);
export const inPlace = [Object][key].groupBy([1], x => x);
export const hop = nested.a[key].withResolvers();
