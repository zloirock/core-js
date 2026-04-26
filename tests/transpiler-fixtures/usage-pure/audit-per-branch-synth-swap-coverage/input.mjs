// destructure receiver is a ConditionalExpression / LogicalExpression: each viable branch
// becomes its own `{key: _Branch$key}` literal independently; non-viable branches (unknown
// identifiers or no matching static method) are left raw
//
// VariableDeclarator init: ternary, both viable
const { from: a1 } = cond ? Array : Map;
// VariableDeclarator init: ||, mixed viable (Array.from yes, userObj unknown)
const { from: a2 } = userObj || Array;
// VariableDeclarator init: ??, member-call left (not Identifier - left stays raw)
const { from: a3 } = pickConstructor() ?? Array;
// AssignmentExpression: ternary, multi-key destructure
let b1, b2;
({ from: b1, of: b2 } = cond ? Array : Map);
// AssignmentPattern (function param default): && reversed
function f({ groupBy } = Promise && Map) { return groupBy; }
// AssignmentPattern: nested conditional - outer ?? wraps inner ?
function g({ try: t } = (cond1 ? Promise : null) ?? Promise) { return t; }
export { a1, a2, a3, b1, b2, f, g };
