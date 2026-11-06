// A literal object keeps its native Object.values read beside an array at capture.
{
const { w: { values }, y: { at } } = { w: Object, y: [1] }; [values, at];
}
