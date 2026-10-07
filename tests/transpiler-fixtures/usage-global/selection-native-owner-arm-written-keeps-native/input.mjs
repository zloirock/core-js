// A selection whose native-owner arm this file writes - the static (`Number.isSafeInteger`) or the
// global's slot (`Math`) - still injects the arm's static, whichever value the write left there
Number.isSafeInteger = shimIsSafeInteger;
export const viaWrittenStatic = (shim || Number).isSafeInteger(7);
globalThis.Math = ShimMath;
export const viaWrittenSlot = (shim || Math).trunc(1.5);
Object.values = shimValues;
export const viaWrittenInstanceKey = (source ?? Object).values(pairs);
