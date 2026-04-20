// Arrow function with AssignmentPattern-wrapped ObjectPattern param: same B4 fix path,
// just the Function grandparent is an ArrowFunctionExpression instead of FunctionDeclaration
const fn = ({ of } = Array) => of(1);
fn;
