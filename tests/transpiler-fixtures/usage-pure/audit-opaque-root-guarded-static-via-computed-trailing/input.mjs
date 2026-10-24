// a COMPUTED trailing key with an SE evaluates after the collapsed static, in source order
let keyCount = 0;
const keySe = () => keyCount++;
const m = () => globalThis;
export const viaComputedTrailing = m()?.window?.Array.from([3])[(keySe(), 'at')](0);
