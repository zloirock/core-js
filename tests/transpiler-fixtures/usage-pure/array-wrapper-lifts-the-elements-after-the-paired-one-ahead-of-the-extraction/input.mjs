// an array wrapper pairs its first element with a two-hop pattern, and the elements after it - one, two, a
// hole between - run as statements ahead of the extraction, in the declaration's place among the statements
// and declarations around it; with no element after it the leaves dispatch off the element alone
function eff() { return Object; }
function eff2() {}
{
const [{ w: { values }, y: { at } }] = [r]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, , eff()]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff()]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff(), eff2()]; [values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; const [{ w: { keys } }] = [r]; [values, at, keys];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; const [{ w: { keys }, y: { flat } }] = [r, eff('m')]; [values, at, keys, flat];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')]; const q = 1; [values, at, q];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')];
}
