// `const fromMethod = a = Array.from` - chained assignment evaluates to its right operand
// at runtime. resolveRuntimeExpression peeled paren / chain / TS wrappers; the
// AssignmentExpression layer survived and the alias walker stopped on the assignment
// itself, missing the `Array.from` static-method binding. added `=` peel so the rightmost
// MemberExpression reaches walkStaticReceiverChain and the call's return-type signature
// triggers the Array.from polyfill import + return-narrowing through Array.includes
let a: unknown;
const fromMethod = a = Array.from;
fromMethod([1, 2, 3]).includes(1);
