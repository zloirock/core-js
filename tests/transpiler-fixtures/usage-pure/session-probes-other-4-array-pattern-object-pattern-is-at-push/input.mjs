// A trailing array effect runs before the native Object.is read and captured at leaf.
const log = [];
{
const known = { w: Object, y: [1] }; const [{ w: { is }, y: { at } }] = [known, log.push('s')]; [is, at];
}
