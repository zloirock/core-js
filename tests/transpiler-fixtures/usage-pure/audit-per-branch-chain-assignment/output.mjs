import _Iterator from "@core-js/pure/actual/iterator/constructor";
// chain assignment `const { from } = foo = cond ? Array : Iterator` - the AssignmentExpression
// evaluates to its RHS at runtime, so destructure semantically targets the conditional value.
// per-branch synth-swap is UNSAFE here: rewriting `cond ? Array : Iterator` to per-branch
// synth objects would change `foo`'s assigned value (foo would receive a synth literal
// instead of the user-expected constructor). pure mode bails on the synth, leaving the
// chain intact - identifier visitor still polyfills Iterator -> _Iterator at the constructor
// site so `foo`'s falsy branch gets the constructor polyfill. Array branch's `from` reads
// raw native (undefined on IE 11) - acceptable trade-off vs breaking the chain assignment
let foo, bar, b, x, y;
const {
  from: a
} = foo = cond ? Array : _Iterator;
({
  from: b
} = bar = cond ? Array : _Iterator);
const {
  from: c
} = x = y = cond ? Array : _Iterator;
export { a, b, c, foo, bar, x, y };