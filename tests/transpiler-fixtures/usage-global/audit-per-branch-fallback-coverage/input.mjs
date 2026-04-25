// usage-global per-branch fallback dispatch: ConditionalExpression / LogicalExpression
// in destructure-receiver position. each branch's deps emit independently regardless of
// which branch the resolver picked as primary. body stays unchanged - only file-level
// imports differ from the no-fallback case
//
// VariableDeclarator init: ternary, both viable
const { from: a1 } = cond ? Array : Iterator;
// VariableDeclarator init: ||, mixed (Array.from yes, userObj unknown - userObj contributes nothing)
const { from: a2 } = userObj || Array;
// VariableDeclarator init: ??, member-call left contributes nothing, Iterator.from viable
const { from: a3 } = pickConstructor() ?? Iterator;
// AssignmentExpression: ternary, multi-key destructure - both keys emit per branch
let b1, b2;
({ from: b1, of: b2 } = cond ? Array : Iterator);
// AssignmentPattern (function param default): && reversed
function f({ from } = Array && Iterator) { return from; }
export { a1, a2, a3, b1, b2, f };
