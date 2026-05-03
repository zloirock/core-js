// arrow expr-body + AssignmentPattern + rest sibling: every fallback gate hits in order.
// synth-swap bails on rest sibling; body-extract bails on missing BlockStatement (no body
// statement slot to host `let from = _polyfill;`); falls through to inline-default. babel's
// emitParamInlineDefault must detect the existing AssignmentPattern wrapper and swap the
// user default expression directly (`= []` -> `= _Array$from`) instead of wrapping again
// (nested AssignmentPattern is invalid AST). unplugin handles the same shape via text
// transform on `value.right`. complementary leaf of the body-extract / synth-swap matrix
const f = ({ from = [], ...rest } = Array) => [from, rest];
f();
