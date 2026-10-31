// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const hopSlot = 'w';
const { [hopSlot]: { Map: viaBoundHopCtor } } = { w: globalThis };
export default [viaBoundHopCtor];
