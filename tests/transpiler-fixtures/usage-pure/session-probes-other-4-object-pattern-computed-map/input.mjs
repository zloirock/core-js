// Shadowed computed keys resolve in the pattern's own scope.
// The selected literal slot retains its native Map read.
const k = 'k';
{
const k = 'z'; const wrapper = { w: globalThis, z: [1, 2] }; { const k = 'w'; const { [k]: { Map: m } } = wrapper; use(m); }
}
