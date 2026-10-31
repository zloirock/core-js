// Quiet literal and bound keys name the same realm value.
// Effectful realm keys retain their native value and navigation reads.
let hits = 0;
const key = 'self';
export const viaPlainKey = globalThis.self;
export const viaLiteralKey = globalThis['self'];
export const viaVariableKey = globalThis[key];
export const viaEffectKey = globalThis[(hits++, 'self')];

export const viaPlainKeyNavigated = globalThis.self.Array;
export const viaEffectKeyNavigated = globalThis[(hits++, 'self')].Array;
export { hits };
