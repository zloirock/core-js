// A spread argument at or before a destructure-pattern parameter slot shifts the arg->param
// mapping, so the destructured member cannot be narrowed from the literal arg - the inferred return
// type (and thus the `.at` receiver) widens to the generic helper.
function f(a: any, { x }) {
  return x;
}
declare const args: any[];
// @ts-expect-error a spread argument tsc cannot place is the shape under test
f(...args, { x: [1, 2, 3] }).at(0);
