const rest = [];
{
const { w: { at: m }, ...rest } = { w: [1, 2], z: 1 }; use(m, rest);
}
