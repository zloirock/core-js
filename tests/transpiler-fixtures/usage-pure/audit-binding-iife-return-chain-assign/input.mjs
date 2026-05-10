// IIFE returning a chain-assign: `(() => (a = Array))()` evaluates to Array at
// runtime. inline-call resolver returns the AssignmentExpression as the body
// expression; resolveObjectName must peel the chain-assign rhs before classifying
(() => (a = Array))().from([]);
