// A selection whose native-owner arm this file writes - the static (`Number.isSafeInteger`) or the
// global's slot (`Math`) - may yield the user's value there, so the identity guard stands down: the read
// stays native, and a key other receivers carry as an instance method keeps that dispatch alone
Number.isSafeInteger = shimIsSafeInteger;
export const viaWrittenStatic = (shim || Number).isSafeInteger(7);
globalThis.Math = ShimMath;
export const viaWrittenSlot = (shim || Math).trunc(1.5);
Object.values = shimValues;
export const viaWrittenInstanceKey = (source ?? Object).values(pairs);
