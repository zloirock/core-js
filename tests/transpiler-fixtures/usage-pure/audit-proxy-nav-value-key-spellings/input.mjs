// what a proxy-global navigation spells is decided by POSITION, never by the key's spelling: a nav read
// as a VALUE answers its own claim's ponyfill, and every key spelling names the same leaf. weighing the
// key's effects there answered `_globalThis` for the noisy spelling and `_self` for each quiet twin -
// two different modules for one read, which is the one thing a proxy alias may never do
let hits = 0;
const key = 'self';
export const viaPlainKey = globalThis.self;
export const viaLiteralKey = globalThis['self'];
export const viaVariableKey = globalThis[key];
export const viaEffectKey = globalThis[(hits++, 'self')];

// ... and a nav something reads THROUGH still rebuilds from the root, whatever the key spells: an
// intermediate `self` would be undefined on a host that has none
export const viaPlainKeyNavigated = globalThis.self.Array;
export const viaEffectKeyNavigated = globalThis[(hits++, 'self')].Array;
export { hits };
