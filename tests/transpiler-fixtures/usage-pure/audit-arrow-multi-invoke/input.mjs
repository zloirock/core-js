// Arrow assigned to a variable then called multiple times: `findIifeCallSite` finds
// the parent of the FunctionExpression/ArrowFunction; if the parent is a VariableDeclarator
// (not a CallExpression), the IIFE site is null and synth-swap bails. Body-extract becomes
// the path forward
const fn = ({ from }) => from([1, 2, 3]);
fn(Array);
fn(Set);
