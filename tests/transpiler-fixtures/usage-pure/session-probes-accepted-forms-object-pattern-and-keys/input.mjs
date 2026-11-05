// A proven call in a selecting object slot remains observable before the keys binding.
// The supported indirect-call static route serves Object.keys.
function eff() { return Object; }
{
const { w: { keys: andHop }, q: andQ } = { w: eff() && Object, q: 1 };
[andHop, andQ];
}
