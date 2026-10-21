// A retained effectful realm receiver keeps native destructuring and user fallback selection.
let c2 = 0;
let ks;
export const ofSynthKept = (({ of } = {}) => of)((ks = globalThis.window)?.[(c2++, 'self')].Array ?? {});
export { c2 };
let c3 = 0;
let ln;
export const logicalNoSynth = ((ln = globalThis.window)?.[(c3++, 'self')].Array ?? Array).from([1]);
const fallbackArray = makeArray();
let lu;
export const logicalUserFallback = ((lu = globalThis.window)?.[(c3++, 'self')].Array ?? fallbackArray).fromAsync([1]);
let tn;
export const ternaryNoSynth = (1 ? (tn = globalThis.window)?.[(c3++, 'self')].Array.prototype.findLast : 0).call([1, 2], v => v < 2);
export { c3 };
