// A for-of head over a bound literal container retains the native from property read.
// The body push call is polyfilled independently.
const out = [];
const W = { w: Array };
for (const { w: { from } } of [W]) out.push(typeof from);
export { out };
