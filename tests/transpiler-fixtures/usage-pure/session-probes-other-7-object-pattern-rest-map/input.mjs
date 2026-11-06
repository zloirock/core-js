// A literal wrapper keeps its native Map read while rest excludes the consumed outer key.
const rest = [];
{
const { w: { Map: m }, ...rest } = { w: globalThis, z: 1 }; use(m, rest);
}
