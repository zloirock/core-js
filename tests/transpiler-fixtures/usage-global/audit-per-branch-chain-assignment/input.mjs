// chain assignment `const { from } = foo = cond ? Array : Iterator` - AssignmentExpression
// evaluates to its RHS, destructure targets the conditional value. usage-global peels
// through `=` chains in `enumerateFallbackBranches` and emits per-branch deps for ALL viable
// constructors regardless of how deep the chain goes. body stays unchanged
let foo, bar, x, y;
const { from: a } = foo = cond ? Array : Iterator;
({ from: b } = bar = cond ? Array : Iterator);
const { from: c } = x = y = cond ? Array : Iterator;
console.log(a, b, c, foo, bar, x, y);
