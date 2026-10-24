// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
const out = [];
const W = { w: Array };
for (const { w: { from } } of [W]) out.push(typeof from);
export { out };
