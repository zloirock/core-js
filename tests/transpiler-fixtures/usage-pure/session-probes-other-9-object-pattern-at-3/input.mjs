const c = 1;
function eff() { return Object; }
{
if (c) var { at: m, z } = eff(); use(m, z);
}
{
if (c) var { w: { at: m }, z } = { w: eff(), z: 1 }; use(m, z);
}
