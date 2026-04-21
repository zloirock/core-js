import _Array$of from "@core-js/pure/actual/array/of";
// Arrow function with AssignmentPattern-wrapped ObjectPattern param: same synth-swap path
// as the function-declaration form, just with ArrowFunctionExpression grandparent
const fn = ({
  of
} = {
  of: _Array$of
}) => of(1);
fn;