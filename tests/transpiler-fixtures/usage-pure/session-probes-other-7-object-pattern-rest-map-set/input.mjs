// Native Map and Set reads share their original literal slot beside outer rest.
const rest = [];
{
const { w: { Map: m, Set: s }, ...rest } = { w: globalThis, z: 1 }; use(m, s, rest);
}
