// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const box = {};
for (const { C: { groupBy } } = (setup(), box.slot = { C: Map }); ; ) break;
let held;
for (const { C: { of } } = (setup(), held = { C: Array }); ; ) break;
for (const { C: { from } } = (box.list = { C: Array }); ; ) break;
