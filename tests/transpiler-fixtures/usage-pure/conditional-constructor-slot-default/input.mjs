// A well-known symbol must be present before the user's leaf default is considered.
let S;
if (true) ({ Symbol: S } = globalThis);
const { iterator: value = 'fallback' } = S;
export const result = typeof value;
