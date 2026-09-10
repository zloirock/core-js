// a `delete` over a navigation whose only `?.` reads off a base that THROWS when absent - a plain
// realm hop over a call yielding the environment probe - has no short-circuit to reproduce, so the
// run folds whole onto the ponyfill. a guard rendered there would test a value the source never
// tested and hand `delete` a conditional, which deletes nothing. two negatives pin the boundary: a
// call root with a proven-defined yield leaves the hop below the `?.` nullish rather than throwing,
// and a `?.` standing on the call value itself guards the probe directly - both keep their guard
// (one global per row: a row deleting a realm SLOT deopts that name for the whole file)
const dw = () => globalThis.window;
const dh = () => globalThis;
let key;
export const foldsUnderTail = delete dw().window?.self.Promise.x;
export const foldsUnderKeyedTail = delete dw().window?.self.Map[key];
export const foldsUnderStaticCall = delete dw().window?.self.Array.of(5);
export const foldsThroughHopTail = delete dw().window?.self.self.Set;
export const keptOverDefinedCallRoot = delete dh().window?.self.WeakMap.x;
export const keptOverTheProbeCall = delete dw()?.window.self.WeakSet.x;
