// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
{
const k = 'Map'; const { w: { [k]: m } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const [{ [k]: { at: m } }] = [{ w: [1, 2] }]; use(m);
}
{
const k = 'w'; const { [k]: [{ at: m }] } = { w: [[1, 2]] }; use(m);
}
{
const k = 'w'; const { [k]: { Array: { of: m } } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const { [k]: { Map: m } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const { [k]: { Map: m } } = { w: globalThis, z: other }; use(m);
}
{
const k = 'w'; const { [k]: { at: m } } = { ...spread, w: [1, 2] }; use(m);
}
{
const k = 'w'; const { [k]: { at: m } } = { w: [1, 2] }; use(m);
}
