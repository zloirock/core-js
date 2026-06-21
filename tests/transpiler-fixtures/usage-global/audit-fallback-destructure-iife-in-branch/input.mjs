// IIFE inside a conditional branch: `cond ? (() => Array)() : Iterator`. outer is a
// ConditionalExpression (no peel needed at top), but each branch is resolved recursively,
// and the consequent's IIFE must peel so branch-level resolution recovers Array as the
// constructor. exercises the per-branch recursion through the CallExpression case.
const { from } = cond ? (() => Array)() : Iterator;
from([1, 2]);
