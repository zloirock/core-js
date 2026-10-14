// An instance leaf under a hop default the assigned literal proves dead, beside a sibling, counts as usage:
// its method's module loads.
let fl, zw;
const holder = { list: [1, 2] };
({ w: { y: { flat: fl } } = { y: [1] }, zw } = { w: { y: holder.list }, zw: 1 });
