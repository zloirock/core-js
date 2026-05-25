// chain-assignment receiver with an IIFE-prefix-SE returning Promise, AND another global
// reference (Set) inside the IIFE body as an ExpressionStatement. Combines the chain-assign
// single-eval guard with the SE-subtree inner-Identifier preservation: the outer static
// dispatch fires (singleReturnBodyExpression accepts ExpressionStatement prefix), so the
// emit subsumes the receiver into a SequenceExpression. Both `Promise` (returned) and `Set`
// (visited as expression) must be polyfilled inside the preserved IIFE body; `calls++`
// runs exactly once.
let a;
let calls = 0;
const r = (a = (() => { calls++; void Set; return Promise; })()).resolve(1);
[r, a, calls];
