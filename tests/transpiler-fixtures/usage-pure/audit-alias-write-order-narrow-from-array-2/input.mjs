// the post-write proxy hop re-enters the live global surface and collapses
let g2;
({ self: g2 } = globalThis);
const sAfter = g2;
export const e = sAfter.Array.from(items);
