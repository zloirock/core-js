// outer flatten on decl[0] + sibling decl[1] IIFE containing INNER flatten (`const
// {Map:{groupBy}} = globalThis;`). previously `polyfillSiblingReceiverRefs` walked into
// the inner declarator's init slot and queued a substitution transform for the inner
// `globalThis`, but inner flatten then overwrote the whole inner VariableDeclaration with
// `const groupBy = _Map$groupBy;` (no `globalThis` in rebuilt text). compose tried to
// substitute the now-dead transform and threw "needle missing" invariant. fix: stop the
// sibling walker from descending into nested VariableDeclarator.init when the declarator's
// id is an ObjectPattern - those slots are owned by their own flatten (or natural visitor)
const { Array: { from } } = globalThis, outer = (function () { const { Map: { groupBy } } = globalThis; return groupBy; })();
console.log(from, outer);
