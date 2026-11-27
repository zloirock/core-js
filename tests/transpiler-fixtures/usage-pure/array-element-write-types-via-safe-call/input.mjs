// An external callback receives the source array and can replace an element.
const scanned = [[1], [2]];
scanned.forEach(f);
export const viaSafeCall = scanned[0].at(1);
