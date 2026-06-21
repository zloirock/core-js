import _Array$of from "@core-js/pure/actual/array/of";
// minifier-shape collapsed inside an arrow function's BlockStatement body. the split must
// recurse through ArrowFunctionExpression -> BlockStatement, not just the Program top level.
// arrow body uses `.of` to differentiate from sibling fixtures that exercise `.from` on the
// same destructure path
let of;
const run = () => {
  sideEffect();
  of = _Array$of;
  return of(1, 2, 3);
};
run();