import _Array$from from "@core-js/pure/actual/array/from";
// a const-bound static-object wrapper as the parameter default (`const w = { a: Array }; ... = w`): the
// nested mirror must descend the object literal per key (`w.a` -> Array) through the shared static receiver
// walk, so `from` resolves to Array.from instead of stranding native off the unclassified alias. distinct
// from a const-aliased PROXY (`= globalThis`) and from a bare ctor - the binding init is an ObjectExpression
const wrapper = {
  a: Array
};
function f({
  a: {
    from
  }
} = {
  a: {
    from: _Array$from
  }
}) {
  return from([1, 2, 3]);
}
export const out = f();