// a NUMERIC pattern key names a container slot exactly as its string spelling does, so the
// key-path walk resolves it - the read side always named it, and the two disagreeing was the
// asymmetry. the negatives keep their bail: a slot the container does not hold, and a
// spread-shifted container whose positions are runtime-determined
const holder = { 0: globalThis };
const { 0: viaNumber } = holder;
export const from = viaNumber.Array.from([1]);

const stringHolder = { 0: globalThis };
const { '0': viaString } = stringHolder;
export const of = viaString.Array.of(1);

const otherSlot = { 1: globalThis };
const { 0: missing } = otherSlot;
export const kept = missing.Array.isArray([]);

const shifted = [...src, globalThis];
const { 0: unknown } = shifted;
export const alsoKept = unknown.Array.isArray([]);
