// NEGATIVE: a proxy-global alias hop captured before the aliasing write reads undefined -
// the hop must not collapse to the pure global surface
let g;
const sBefore = g;
({ self: g } = globalThis);
export const d = sBefore.Array.from(items);
