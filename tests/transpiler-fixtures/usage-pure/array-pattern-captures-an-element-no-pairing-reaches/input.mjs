// where no pairing reaches the element - an element read off a literal by index, an element literal whose
// slot holds a call - the array pattern captures the element natively and the leaves dispatch off it
function eff() { return Object; }
{
const [{ w: { values }, y: { at } }] = [eff(), r][1]; [values, at];
}
{
const [{ y: { at: ci } }] = [{ y: getArr() }]; use(ci);
}
