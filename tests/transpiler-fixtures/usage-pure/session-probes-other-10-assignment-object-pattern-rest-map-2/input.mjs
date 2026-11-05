// A literal-object assignment keeps its native Map read and rest exclusion.
const rest = [];
{
let m, rest; ({ w: { Map: m }, ...rest } = { w: globalThis, z: 1 }); use(m, rest);
}
