// combo: nested proxy-global destructure from `globalThis` in for-init position + preceding
// side-effect expression in SequenceExpression init + body uses the destructured binding
function se() { return globalThis; }
for (const { Array: { from } } = (se(), globalThis); false;) from([]);
