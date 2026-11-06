// a pattern the lift leaves - one hop, an unclaimed key beside the claimed ones, the wrapper's trailing
// spread - keeps a husk that evaluates the wrapper's elements ahead of the extraction, the unclaimed level
// read once; with no element after the paired one there is no husk
const rest = [];
function eff() { return Object; }
{
const [{ y: { at } }] = [r, eff('n')]; at;
}
{
const [{ y: { at } }] = [r]; at;
}
{
const [{ w: { values, is }, y: { at } }] = [r, eff('n')]; [values, is, at];
}
{
const [{ w: { values }, y: { at } }] = [r, ...rest]; [values, at];
}
