// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const k = 'k';
{
const k = 'z'; const wrapper = { w: globalThis, z: [1, 2] }; { const k = 'w'; const { [k]: { Map: m } } = wrapper; use(m); }
}
