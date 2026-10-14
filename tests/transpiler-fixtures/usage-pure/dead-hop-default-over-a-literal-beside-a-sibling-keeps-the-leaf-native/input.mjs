// A hop default the destructured literal proves dead, beside a sibling in a declaration, keeps the leaf under
// it native in both emitters (an accepted limit): the literal arm is never served, though without the sibling
// both extract it. The assignment form is babel's debt alone.
const holder = { list: [1, 2] };
const { w: { y: { flat: fl } } = { y: [1] }, zw } = { w: { y: holder.list }, zw: 1 };
const { w: { y: { at: alone } } = { y: [1] } } = { w: { y: holder.list } };
export { fl, zw, alone };
