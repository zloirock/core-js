// combo: nested proxy-global destructure from `globalThis` in for-init position + preceding
// side-effect expression in SequenceExpression init + body uses the destructured binding.
// for-init can't host an extracted SE prefix statement (loop header is single-expression-only),
// so the raw shape is preserved with the polyfill moved into the AssignmentPattern default slot
function se() { return globalThis; }
for (const { Array: { from } } = (se(), globalThis); false;) from([]);
