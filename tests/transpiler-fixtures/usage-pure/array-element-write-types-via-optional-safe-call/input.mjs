// an optional-chained SAFE method keeps the precision - the optional lowering must not
// degrade a registry-known non-mutating call into an unknown one
const opted = [[1], [2]];
export const viaOptionalSafeCall = opted[0].at(3);
