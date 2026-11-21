// Handing out each element preserves the value in the outer slot.
const looped = [[1], [2]];
for (const el of looped) use(el);
export const viaForOfEscape = looped[0].at(9);
