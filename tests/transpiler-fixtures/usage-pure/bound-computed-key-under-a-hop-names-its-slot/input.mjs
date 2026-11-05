// Bound computed keys preserve the actual slot under nested object and array patterns.
// Instance claims use that slot's receiver; literal-container statics and constructors stay native.
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
