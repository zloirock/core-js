// per-branch dispatch when fallback receivers are MemberExpressions, not bare Identifiers.
// resolveObjectName already accepts proxy-global member chains; enumerateFallbackDestructureBranches
// must peel paren wrappers (oxc preserves) and accept MemberExpression branches so each
// branch's deps emit independently. without the per-branch peel, only one branch's polyfill
// reaches the file-level imports
const { from: a } = cond ? globalThis.Array : globalThis.Iterator;
const { from: b } = userFn() || globalThis.Array;
const { of: c } = cond ? Iterator : globalThis.Array;
export { a, b, c };
