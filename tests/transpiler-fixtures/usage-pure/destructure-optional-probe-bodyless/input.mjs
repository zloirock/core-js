// A bodyless assignment still coerces its fully consumed source before any write.
const log = [];
let of;
if (log.push('before')) ({ of } = globalThis.window?.[(log.push([7].at(0)), 'Array')]);
export const result = [of(3), log];
