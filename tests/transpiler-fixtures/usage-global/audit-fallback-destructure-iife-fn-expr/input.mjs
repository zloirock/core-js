// IIFE shape via `function() {}` instead of arrow -- FunctionExpression callee path in
// `peelZeroArgIifeReturn`. body must be a single-Return BlockStatement. supports legacy
// codebases / non-arrow-friendly transpiler output where the factory wrapper is written
// as `(function() { return ... })()`.
const { from } = (function() { return cond ? Array : Iterator; })();
from([1, 2]);
