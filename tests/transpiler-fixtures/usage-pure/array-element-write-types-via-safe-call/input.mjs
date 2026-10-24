// a registry-known non-mutating method keeps the per-element precision
const scanned = [[1], [2]];
export const viaSafeCall = scanned[0].at(1);
