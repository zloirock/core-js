import _Iterator from "@core-js/pure/actual/iterator/constructor";
// IIFE arg is a chain-assignment `store = cond ? Array : Iterator`: per-branch synth
// must NOT reshape the conditional, since rewriting branches would change the value
// bound to the outer `store` variable
let store;
const result = (({
  from
}) => from([1]))(store = cond ? Array : _Iterator);
export { result, store };