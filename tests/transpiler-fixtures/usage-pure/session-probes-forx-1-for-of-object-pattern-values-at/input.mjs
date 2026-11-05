// A loop-body pattern keeps native Object.values and captures the nested array at receiver.
{
for (const _r of [{ w: Object, y: [1] }]) { let { w: { values }, y: { at } } = _r; [values, at]; }
}
