const settled = { C: Promise };
const named = settled;
const either = opener || named;
either.C = userValue;
export const all = named.C.allSettled([]);
