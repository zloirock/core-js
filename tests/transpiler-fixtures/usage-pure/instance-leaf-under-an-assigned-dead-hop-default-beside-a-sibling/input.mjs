// An assigned literal supplies the live nested instance receiver beside an outer sibling.
// The captured slot supplies the instance helper; the dead hop default never runs.
let fl, zw;
const holder = { list: [1, 2] };
({ w: { y: { flat: fl } } = { y: [1] }, zw } = { w: { y: holder.list }, zw: 1 });
