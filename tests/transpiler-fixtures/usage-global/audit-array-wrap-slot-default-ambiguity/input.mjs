// a slot default is default-or-runtime: the binding MIGHT be the default's global (it fires
// whenever the runtime pair is undefined), so usage-global keeps the maybe-union and injects
// the default's modules - inject-if-might is sound here, unlike the pure fold which must bail
let t = [{}, {}];

// defined foreign pair: the default still registers the maybe (over-inject safe)
let userObj = {};
const [p0, { Map: M } = globalThis] = [{}, userObj];
export const viaForeignPair = M.groupBy([1, 2], v => v);

// spread-shifted pair: the default may fire - the array leg injects
const [s0, { Array: A } = globalThis] = [...t];
export const viaSpreadPair = A.from([1, 2]);

// control: a provably-defined pair resolves and injects its constructor modules
let fallback = {};
const [{ Set: C } = fallback] = [globalThis];
export const viaSoundPair = new C(soundSeed);
