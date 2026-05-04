// IIFE body wraps the receiver decision in a WhileStatement. loop body may early-return
// Map; tail returns Set. `singleReturnBodyExpression` must bail on WhileStatement so the
// outer IIFE call stays raw. inner Map / Set constructors still polyfill independently
const out = (() => { while (cond) { return Map; } return Set; })().of(2);
export { out };
