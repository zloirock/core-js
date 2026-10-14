// A `delete` whose only `?.` reads off a hop that throws when the probe is absent (a realm hop over a
// call yielding `window`) has no short-circuit to keep, so the run folds whole onto the ponyfill. Two
// negatives keep their guard: a call yielding the realm, whose `window` hop may be nullish, and a `?.`
// on the call value, which tests the probe directly. One global per row: deleting a realm slot holds
// that name native for the whole file.
const dw = () => globalThis.window;
const dh = () => globalThis;
let key;
export const foldsUnderTail = delete dw().window?.self.Promise.x;
export const foldsUnderKeyedTail = delete dw().window?.self.Map[key];
export const foldsUnderStaticCall = delete dw().window?.self.Array.of(5);
export const foldsThroughHopTail = delete dw().window?.self.self.Set;
export const keptOverDefinedCallRoot = delete dh().window?.self.WeakMap.x;
export const keptOverTheProbeCall = delete dw()?.window.self.WeakSet.x;
