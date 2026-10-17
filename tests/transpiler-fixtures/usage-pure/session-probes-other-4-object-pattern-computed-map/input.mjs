const k = 'k';
{
const k = 'z'; const wrapper = { w: globalThis, z: [1, 2] }; { const k = 'w'; const { [k]: { Map: m } } = wrapper; use(m); }
}
