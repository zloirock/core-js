import _Iterator from "@core-js/pure/actual/iterator/constructor";
// chain assignment `const { from } = foo = cond ? Array : Iterator`. the AssignmentExpression
// evaluates to its RHS, so the destructure also targets the conditional value. rewriting
// the branches into synth literals would change what `foo` receives, so the chain is left
// intact: only the bare `Iterator` constructor is rewritten in place. `Array` branch's
// `from` reads raw native (acceptable trade-off vs breaking the chain assignment)
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