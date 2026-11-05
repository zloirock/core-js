// A literal wrapper keeps its native nested Array.of read and outer rest exclusion.
const rest = [];
{
const { w: { Array: { of: m } }, ...rest } = { w: globalThis, z: 1 }; use(m, rest);
}
