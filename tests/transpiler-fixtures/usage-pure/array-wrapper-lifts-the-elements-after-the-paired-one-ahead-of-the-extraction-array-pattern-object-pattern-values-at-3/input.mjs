// an array wrapper pairs its first element with a two-hop pattern, and the elements after it - one, two, a
// hole between - run as statements ahead of the extraction, in the declaration's place among the statements
// and declarations around it; with no element after it the leaves dispatch off the element alone
function eff() { return Object; }
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; [values, at];
}
