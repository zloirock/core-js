// A statically paired realm element never evaluates its receiver fallback.
// The Set extraction and construction remain native inside the literal-wrapper boundary.
let fallback = {};
const [{ Set: C } = fallback] = [globalThis];
export const viaSoundPair = new C(soundSeed);
