// Arrow assigned to a variable then called multiple times: the function's parent is a
// VariableDeclarator, not a CallExpression, so there is no IIFE call site and synth-swap
// bails. Body-extract becomes the path forward
const fn = ({ from }) => from([1, 2, 3]);
fn(Array);
fn(Set);
