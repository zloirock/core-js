// IIFE inside conditional branch: `cond ? (() => Array)() : Iterator`. outer is a
// ConditionalExpression (no IIFE peel needed at top), but each branch is recursively
// resolved through `buildDestructuringInitMeta` -- the consequent's IIFE must peel so
// branch-level resolution recovers Array as the constructor. exercises the per-branch
// recursion path through the new CallExpression case in the switch.
const { from } = cond ? (() => Array)() : Iterator;
from([1, 2]);
