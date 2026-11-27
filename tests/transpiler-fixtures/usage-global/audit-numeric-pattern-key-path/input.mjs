// a NUMERIC pattern key names a container slot exactly as its string spelling does, so the
// key-path walk resolves it - the read side always named it, and the two disagreeing was the
// asymmetry.
const holder = { 0: globalThis };
const { 0: viaNumber } = holder;
export const from = viaNumber.Array.from([1]);

const stringHolder = { 0: globalThis };
const { '0': viaString } = stringHolder;
export const of = viaString.Array.of(1);
