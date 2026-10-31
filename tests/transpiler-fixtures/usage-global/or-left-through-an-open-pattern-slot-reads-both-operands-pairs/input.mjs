let pair = { C: WeakSet };
if (flag) pair = { C: null };
const { C: Q } = pair;
export const pairs = (Q || Object).entries;
