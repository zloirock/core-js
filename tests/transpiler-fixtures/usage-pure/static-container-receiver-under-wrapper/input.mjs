// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
let hits = 0;
function once() { hits += 1; return { w: Array }; }
const { w: { from: nestedHop } } = { w: ({ w: Array }).w };
const [{ from: arrayWrapped }] = [({ w: Array }).w];
const { w: { from: effectful } } = { w: once().w };
const { w: { from: indexed } } = { w: [Array][0] };
export { nestedHop, arrayWrapped, effectful, indexed, hits };
