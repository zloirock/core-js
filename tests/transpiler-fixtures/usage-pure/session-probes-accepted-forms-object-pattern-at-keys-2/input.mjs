// A call-valued literal slot with at and keys retains both native reads beside its sibling.
const k = 'k';
function eff() { return Object; }
{
const { w: { at: m, keys: k }, z } = { w: eff(), z: 1 }; use(m, k, z);
}
