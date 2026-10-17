// a const-bound array wrapper reached through a PATTERN slot still descends to its real value
const [wrapper] = [[globalThis]];
export const [{ Object: { fromEntries: viaWrapper } }] = wrapper;
export const wrapperResolved = viaWrapper([['d', 4]]);
