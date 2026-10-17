// an SE-carrying inline BODY of the call root replays as a sequence prefix on the collapsed
// guard test (`(db(), _self).window`) - the effect runs exactly once, the branch reads the
// ponyfill leaf
let bodyCount = 0;
const db = () => { bodyCount++; return globalThis; };
export const viaSeBodyRoot = db()?.self?.window?.Array.of(11).at(0);
