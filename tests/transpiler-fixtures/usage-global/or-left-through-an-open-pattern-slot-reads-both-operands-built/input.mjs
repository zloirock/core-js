const held = { C: Set };
clobber(held);
const { C: S } = held;
export const built = (S ?? Object).fromEntries;
