// Arrow function with AssignmentPattern-wrapped ObjectPattern param: same synth-swap path
// as the function-declaration form, just with ArrowFunctionExpression grandparent
const fn = ({ of } = Array) => of(1);
fn;
