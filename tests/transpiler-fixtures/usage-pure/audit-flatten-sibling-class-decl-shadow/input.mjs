// ClassDeclaration (vs ClassExpression) inside a sibling function body. the class id
// binds inside the function/class scope; method refs to `globalThis` resolve to the class.
// confirms scope tracking handles BOTH `ClassExpression` AND `ClassDeclaration` (only the
// former is reachable as a direct sibling declarator init; the latter only via a function
// body that contains class declarations).
const { Array: { from } } = globalThis, fn = () => { class globalThis { m() { return globalThis; } } return new globalThis().m(); };
console.log(from, fn);
